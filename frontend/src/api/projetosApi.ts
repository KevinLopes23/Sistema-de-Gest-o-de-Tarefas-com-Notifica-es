import { apiClient } from './apiClient';
import type { AtualizarProjetoRequest, CriarProjetoRequest, Projeto } from '@/types';

export const projetosApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listarProjetos: builder.query<Projeto[], void>({
      query: () => '/projetos',
      providesTags: (result) =>
        result
          ? [...result.map((p) => ({ type: 'Projeto' as const, id: p.id })), { type: 'Projeto', id: 'LIST' }]
          : [{ type: 'Projeto', id: 'LIST' }],
    }),
    obterProjeto: builder.query<Projeto, number>({
      query: (id) => `/projetos/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Projeto', id }],
    }),
    criarProjeto: builder.mutation<Projeto, CriarProjetoRequest>({
      query: (body) => ({ url: '/projetos', method: 'POST', body }),
      invalidatesTags: [{ type: 'Projeto', id: 'LIST' }, 'Dashboard'],
    }),
    atualizarProjeto: builder.mutation<Projeto, { id: number; body: AtualizarProjetoRequest }>({
      query: ({ id, body }) => ({ url: `/projetos/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Projeto', id }, { type: 'Projeto', id: 'LIST' }],
    }),
    excluirProjeto: builder.mutation<void, number>({
      query: (id) => ({ url: `/projetos/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Projeto', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useListarProjetosQuery,
  useObterProjetoQuery,
  useCriarProjetoMutation,
  useAtualizarProjetoMutation,
  useExcluirProjetoMutation,
} = projetosApi;
