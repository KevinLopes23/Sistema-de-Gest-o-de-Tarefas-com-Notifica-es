import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { ArrowRight, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatusBadge, PrioridadeBadge, AtrasadaBadge } from '@/components/ui/Badges';
import { useListarProjetosQuery } from '@/api/projetosApi';
import { useAlterarStatusTarefaMutation, useExcluirTarefaMutation, useListarTarefasQuery } from '@/api/tarefasApi';
import { TarefaFormModal } from './TarefaFormModal';
import type { ApiProblemDetails, StatusTarefa, Tarefa, TarefaFiltro } from '@/types';

const proximoStatus: Partial<Record<StatusTarefa, StatusTarefa>> = {
  Pendente: 'EmAndamento',
  EmAndamento: 'Concluida',
};

const proximoStatusConfig: Partial<Record<StatusTarefa, { label: string; icon: typeof Play }>> = {
  Pendente: { label: 'Iniciar', icon: Play },
  EmAndamento: { label: 'Concluir', icon: ArrowRight },
};

export function TarefasPage() {
  const [searchParams] = useSearchParams();
  const projetoIdInicial = searchParams.get('projetoId');

  const { data: projetos = [] } = useListarProjetosQuery();

  const [filtro, setFiltro] = useState<TarefaFiltro>({
    projetoId: projetoIdInicial ? Number(projetoIdInicial) : undefined,
    ordenarPor: 'prazo',
  });

  const { data: tarefas, isLoading } = useListarTarefasQuery(filtro);
  const [alterarStatus] = useAlterarStatusTarefaMutation();
  const [excluirTarefa, { isLoading: excluindo }] = useExcluirTarefaMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<Tarefa | null>(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<Tarefa | null>(null);

  const responsaveis = useMemo(() => {
    const nomes = new Map<number, string>();
    tarefas?.forEach((t) => {
      if (t.responsavelId && t.responsavelNome) nomes.set(t.responsavelId, t.responsavelNome);
    });
    return Array.from(nomes.entries());
  }, [tarefas]);

  const abrirCriacao = () => {
    setTarefaEmEdicao(null);
    setFormOpen(true);
  };

  const abrirEdicao = (tarefa: Tarefa) => {
    setTarefaEmEdicao(tarefa);
    setFormOpen(true);
  };

  const avancarStatus = async (tarefa: Tarefa) => {
    const novoStatus = proximoStatus[tarefa.status];
    if (!novoStatus) return;
    try {
      await alterarStatus({ id: tarefa.id, status: novoStatus }).unwrap();
      toast.success(`Tarefa marcada como "${novoStatus === 'EmAndamento' ? 'Em Andamento' : 'Concluída'}".`);
    } catch (err) {
      const problem = err as { data?: ApiProblemDetails };
      toast.error(problem.data?.title ?? 'Não foi possível alterar o status.');
    }
  };

  const confirmarExclusao = async () => {
    if (!tarefaParaExcluir) return;
    try {
      await excluirTarefa(tarefaParaExcluir.id).unwrap();
      toast.success('Tarefa excluída com sucesso.');
      setTarefaParaExcluir(null);
    } catch (err) {
      const problem = err as { data?: ApiProblemDetails };
      toast.error(problem.data?.title ?? 'Não foi possível excluir a tarefa.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500 dark:text-brand-400">// acompanhamento</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">Tarefas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe e gerencie as tarefas da equipe.</p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus className="h-4 w-4" aria-hidden />
          Nova tarefa
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Select
          value={filtro.projetoId ?? ''}
          onChange={(e) => setFiltro((f) => ({ ...f, projetoId: e.target.value ? Number(e.target.value) : undefined }))}
          className="w-full sm:w-auto"
        >
          <option value="">Todos os projetos</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>

        <Select
          value={filtro.status ?? ''}
          onChange={(e) => setFiltro((f) => ({ ...f, status: (e.target.value || undefined) as StatusTarefa | undefined }))}
          className="w-full sm:w-auto"
        >
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="EmAndamento">Em Andamento</option>
          <option value="Concluida">Concluída</option>
          <option value="Cancelada">Cancelada</option>
        </Select>

        <Select
          value={filtro.responsavelId ?? ''}
          onChange={(e) => setFiltro((f) => ({ ...f, responsavelId: e.target.value ? Number(e.target.value) : undefined }))}
          className="w-full sm:w-auto"
        >
          <option value="">Todos os responsáveis</option>
          {responsaveis.map(([id, nome]) => (
            <option key={id} value={id}>
              {nome}
            </option>
          ))}
        </Select>

        <Select
          value={filtro.ordenarPor ?? 'prazo'}
          onChange={(e) => setFiltro((f) => ({ ...f, ordenarPor: e.target.value as TarefaFiltro['ordenarPor'] }))}
          className="w-full sm:w-auto"
        >
          <option value="prazo">Ordenar por prazo</option>
          <option value="prioridade">Ordenar por prioridade</option>
          <option value="status">Ordenar por status</option>
          <option value="titulo">Ordenar por título</option>
        </Select>
      </div>

      {isLoading && <FullPageSpinner />}

      {!isLoading && tarefas && tarefas.length === 0 && (
        <EmptyState
          title="Nenhuma tarefa encontrada"
          description="Ajuste os filtros ou crie uma nova tarefa."
          action={
            <Button onClick={abrirCriacao}>
              <Plus className="h-4 w-4" aria-hidden />
              Nova tarefa
            </Button>
          }
        />
      )}

      {!isLoading && tarefas && tarefas.length > 0 && (
        <div className="animate-fade-in-up overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-bold">Tarefa</th>
                <th className="px-4 py-3 font-bold">Projeto</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Prioridade</th>
                <th className="px-4 py-3 font-bold">Prazo</th>
                <th className="px-4 py-3 font-bold">Conclusão</th>
                <th className="px-4 py-3 font-bold">Responsável</th>
                <th className="px-4 py-3 text-right font-bold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tarefas.map((tarefa) => {
                const proximo = proximoStatusConfig[tarefa.status];
                return (
                  <tr
                    key={tarefa.id}
                    data-testid="tarefa-row"
                    className="transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-500/5"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{tarefa.titulo}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{tarefa.projetoNome}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={tarefa.status} />
                        {tarefa.isAtrasada && <AtrasadaBadge />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PrioridadeBadge prioridade={tarefa.prioridade} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {format(new Date(tarefa.dataPrazo), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {tarefa.dataConclusao
                        ? format(new Date(tarefa.dataConclusao), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{tarefa.responsavelNome ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {proximo && (
                          <Button variant="ghost" className="px-2" onClick={() => avancarStatus(tarefa)}>
                            <proximo.icon className="h-4 w-4" aria-hidden />
                            {proximo.label}
                          </Button>
                        )}
                        <Button variant="ghost" className="px-2" onClick={() => abrirEdicao(tarefa)}>
                          <Pencil className="h-4 w-4" aria-hidden />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-2 text-red-600 dark:text-red-400"
                          onClick={() => setTarefaParaExcluir(tarefa)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TarefaFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        tarefa={tarefaEmEdicao}
        projetoIdPadrao={filtro.projetoId}
      />

      <ConfirmDialog
        open={Boolean(tarefaParaExcluir)}
        title="Excluir tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${tarefaParaExcluir?.titulo}"? Tarefas "Em Andamento" não podem ser excluídas.`}
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onCancel={() => setTarefaParaExcluir(null)}
      />
    </div>
  );
}
