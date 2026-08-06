import { configureStore } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiClient.reducerPath]: apiClient.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiClient.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
