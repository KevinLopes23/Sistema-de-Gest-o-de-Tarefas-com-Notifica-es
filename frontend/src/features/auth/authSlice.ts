import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse, Usuario } from '@/types';

const STORAGE_KEY = 'taskmanagement.auth';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
}

function loadInitialState(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, usuario: null };

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return { token: null, usuario: null };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    credenciaisRecebidas: (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.token;
      state.usuario = action.payload.usuario;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    logout: (state) => {
      state.token = null;
      state.usuario = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { credenciaisRecebidas, logout } = authSlice.actions;
export default authSlice.reducer;
