import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { logout } from '@/features/auth/authSlice';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const baseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const apiClient = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.error?.status === 401) {
      api.dispatch(logout());
    }
    return result;
  },
  tagTypes: ['Projeto', 'Tarefa', 'Dashboard', 'Notificacao'],
  endpoints: () => ({}),
});
