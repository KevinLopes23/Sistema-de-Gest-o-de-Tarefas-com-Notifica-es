import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useListarProjetosQuery, useExcluirProjetoMutation } from '@/api/projetosApi';
import { ProjetoFormModal } from './ProjetoFormModal';
import type { ApiProblemDetails, Projeto } from '@/types';

export function ProjetosPage() {
  const { data: projetos, isLoading } = useListarProjetosQuery();
  const [excluirProjeto, { isLoading: excluindo }] = useExcluirProjetoMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [projetoEmEdicao, setProjetoEmEdicao] = useState<Projeto | null>(null);
  const [projetoParaExcluir, setProjetoParaExcluir] = useState<Projeto | null>(null);

  const abrirCriacao = () => {
    setProjetoEmEdicao(null);
    setFormOpen(true);
  };

  const abrirEdicao = (projeto: Projeto) => {
    setProjetoEmEdicao(projeto);
    setFormOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!projetoParaExcluir) return;
    try {
      await excluirProjeto(projetoParaExcluir.id).unwrap();
      toast.success('Projeto excluído com sucesso.');
      setProjetoParaExcluir(null);
    } catch (err) {
      const problem = err as { data?: ApiProblemDetails };
      toast.error(problem.data?.title ?? 'Não foi possível excluir o projeto.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projetos</h1>
          <p className="text-sm text-slate-500">Gerencie os projetos da sua equipe.</p>
        </div>
        <Button onClick={abrirCriacao}>+ Novo projeto</Button>
      </div>

      {isLoading && <FullPageSpinner />}

      {!isLoading && projetos && projetos.length === 0 && (
        <EmptyState
          title="Nenhum projeto cadastrado"
          description="Crie o primeiro projeto para começar a organizar as tarefas da equipe."
          action={<Button onClick={abrirCriacao}>+ Novo projeto</Button>}
        />
      )}

      {!isLoading && projetos && projetos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto) => {
            const progresso =
              projeto.totalTarefas === 0 ? 0 : Math.round((projeto.totalTarefasConcluidas / projeto.totalTarefas) * 100);

            return (
              <div key={projeto.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{projeto.nome}</h3>
                </div>
                {projeto.descricao && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{projeto.descricao}</p>}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {projeto.totalTarefasConcluidas}/{projeto.totalTarefas} tarefas concluídas
                    </span>
                    <span>{progresso}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${progresso}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Link
                    to={`/tarefas?projetoId=${projeto.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Ver tarefas →
                  </Link>
                  <div className="flex gap-1">
                    <Button variant="ghost" className="px-2" onClick={() => abrirEdicao(projeto)}>
                      Editar
                    </Button>
                    <Button variant="ghost" className="px-2 text-red-600" onClick={() => setProjetoParaExcluir(projeto)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjetoFormModal open={formOpen} onClose={() => setFormOpen(false)} projeto={projetoEmEdicao} />

      <ConfirmDialog
        open={Boolean(projetoParaExcluir)}
        title="Excluir projeto"
        message={`Tem certeza que deseja excluir o projeto "${projetoParaExcluir?.nome}"? Só é possível excluir projetos sem tarefas vinculadas.`}
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onCancel={() => setProjetoParaExcluir(null)}
      />
    </div>
  );
}
