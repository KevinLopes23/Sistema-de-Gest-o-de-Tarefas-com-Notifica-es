import { apiClient } from './apiClient';
import type { Usuario } from '@/types';

export const usuariosApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listarUsuarios: builder.query<Usuario[], void>({
      query: () => '/usuarios',
    }),
  }),
});

export const { useListarUsuariosQuery } = usuariosApi;
