import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
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

const proximoStatusLabel: Partial<Record<StatusTarefa, string>> = {
  Pendente: 'Iniciar',
  EmAndamento: 'Concluir',
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
          <h1 className="text-xl font-semibold text-slate-900">Tarefas</h1>
          <p className="text-sm text-slate-500">Acompanhe e gerencie as tarefas da equipe.</p>
        </div>
        <Button onClick={abrirCriacao}>+ Nova tarefa</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Select
          value={filtro.projetoId ?? ''}
          onChange={(e) => setFiltro((f) => ({ ...f, projetoId: e.target.value ? Number(e.target.value) : undefined }))}
          className="w-auto"
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
          className="w-auto"
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
          className="w-auto"
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
          className="w-auto"
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
          action={<Button onClick={abrirCriacao}>+ Nova tarefa</Button>}
        />
      )}

      {!isLoading && tarefas && tarefas.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tarefa</th>
                <th className="px-4 py-3 font-medium">Projeto</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Prioridade</th>
                <th className="px-4 py-3 font-medium">Prazo</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tarefas.map((tarefa) => (
                <tr key={tarefa.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{tarefa.titulo}</td>
                  <td className="px-4 py-3 text-slate-500">{tarefa.projetoNome}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={tarefa.status} />
                      {tarefa.isAtrasada && <AtrasadaBadge />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PrioridadeBadge prioridade={tarefa.prioridade} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {format(new Date(tarefa.dataPrazo), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{tarefa.responsavelNome ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {proximoStatus[tarefa.status] && (
                        <Button variant="ghost" className="px-2" onClick={() => avancarStatus(tarefa)}>
                          {proximoStatusLabel[tarefa.status]}
                        </Button>
                      )}
                      <Button variant="ghost" className="px-2" onClick={() => abrirEdicao(tarefa)}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-2 text-red-600"
                        onClick={() => setTarefaParaExcluir(tarefa)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
