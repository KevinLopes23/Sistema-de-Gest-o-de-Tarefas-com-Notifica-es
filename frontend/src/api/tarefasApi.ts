import { apiClient } from './apiClient';
import type {
  AtualizarTarefaRequest,
  CriarTarefaRequest,
  StatusTarefa,
  Tarefa,
  TarefaFiltro,
} from '@/types';

function buildQueryString(filtro: TarefaFiltro): string {
  const params = new URLSearchParams();
  if (filtro.projetoId) params.set('projetoId', String(filtro.projetoId));
  if (filtro.status) params.set('status', filtro.status);
  if (filtro.responsavelId) params.set('responsavelId', String(filtro.responsavelId));
  if (filtro.prazoAte) params.set('prazoAte', filtro.prazoAte);
  if (filtro.ordenarPor) params.set('ordenarPor', filtro.ordenarPor);
  if (filtro.descendente) params.set('descendente', 'true');
  return params.toString();
}

export const tarefasApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    listarTarefas: builder.query<Tarefa[], TarefaFiltro | void>({
      query: (filtro) => `/tarefas?${buildQueryString(filtro ?? {})}`,
      providesTags: (result) =>
        result
          ? [...result.map((t) => ({ type: 'Tarefa' as const, id: t.id })), { type: 'Tarefa', id: 'LIST' }]
          : [{ type: 'Tarefa', id: 'LIST' }],
    }),
    obterTarefa: builder.query<Tarefa, number>({
      query: (id) => `/tarefas/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Tarefa', id }],
    }),
    criarTarefa: builder.mutation<Tarefa, CriarTarefaRequest>({
      query: (body) => ({ url: '/tarefas', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tarefa', id: 'LIST' }, { type: 'Projeto', id: 'LIST' }, 'Dashboard'],
    }),
    atualizarTarefa: builder.mutation<Tarefa, { id: number; body: AtualizarTarefaRequest }>({
      query: ({ id, body }) => ({ url: `/tarefas/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Tarefa', id }, { type: 'Tarefa', id: 'LIST' }],
    }),
    alterarStatusTarefa: builder.mutation<Tarefa, { id: number; status: StatusTarefa }>({
      query: ({ id, status }) => ({ url: `/tarefas/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Tarefa', id },
        { type: 'Tarefa', id: 'LIST' },
        { type: 'Projeto', id: 'LIST' },
        'Dashboard',
      ],
    }),
    excluirTarefa: builder.mutation<void, number>({
      query: (id) => ({ url: `/tarefas/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Tarefa', id: 'LIST' }, { type: 'Projeto', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useListarTarefasQuery,
  useObterTarefaQuery,
  useCriarTarefaMutation,
  useAtualizarTarefaMutation,
  useAlterarStatusTarefaMutation,
  useExcluirTarefaMutation,
} = tarefasApi;
