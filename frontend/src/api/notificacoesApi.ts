import { apiClient } from './apiClient';
import type { Notificacao } from '@/types';

export const notificacoesApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listarNotificacoes: builder.query<Notificacao[], void>({
      query: () => '/notificacoes',
      providesTags: (result) =>
        result
          ? [...result.map((n) => ({ type: 'Notificacao' as const, id: n.id })), { type: 'Notificacao', id: 'LIST' }]
          : [{ type: 'Notificacao', id: 'LIST' }],
    }),
    marcarNotificacaoComoLida: builder.mutation<void, number>({
      query: (id) => ({ url: `/notificacoes/${id}/lida`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notificacao', id: 'LIST' }],
    }),
  }),
});

export const { useListarNotificacoesQuery, useMarcarNotificacaoComoLidaMutation } = notificacoesApi;
