import { apiClient } from './apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    registrar: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/auth/registrar', method: 'POST', body }),
    }),
  }),
});

export const { useLoginMutation, useRegistrarMutation } = authApi;
