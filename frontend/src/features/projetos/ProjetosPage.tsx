import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500 dark:text-brand-400">// portfólio</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">Projetos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie os projetos da sua equipe.</p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus className="h-4 w-4" aria-hidden />
          Novo projeto
        </Button>
      </div>

      {isLoading && <FullPageSpinner />}

      {!isLoading && projetos && projetos.length === 0 && (
        <EmptyState
          title="Nenhum projeto cadastrado"
          description="Crie o primeiro projeto para começar a organizar as tarefas da equipe."
          action={
            <Button onClick={abrirCriacao}>
              <Plus className="h-4 w-4" aria-hidden />
              Novo projeto
            </Button>
          }
        />
      )}

      {!isLoading && projetos && projetos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto, index) => {
            const progresso =
              projeto.totalTarefas === 0 ? 0 : Math.round((projeto.totalTarefasConcluidas / projeto.totalTarefas) * 100);

            return (
              <div
                key={projeto.id}
                data-testid="projeto-card"
                className="group flex animate-fade-in-up flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 transition-transform group-hover:scale-105 dark:from-slate-800 dark:to-slate-800 dark:text-brand-400">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {progresso}%
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{projeto.nome}</h3>
                {projeto.descricao && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{projeto.descricao}</p>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {projeto.totalTarefasConcluidas}/{projeto.totalTarefas} tarefas concluídas
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-500 ease-out"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Link
                    to={`/tarefas?projetoId=${projeto.id}`}
                    className="flex items-center gap-1 whitespace-nowrap text-sm font-bold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Ver tarefas
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" className="px-2" onClick={() => abrirEdicao(projeto)}>
                      <Pencil className="h-4 w-4" aria-hidden />
                      Editar
                    </Button>
                    <Button variant="ghost" className="px-2 text-red-600 dark:text-red-400" onClick={() => setProjetoParaExcluir(projeto)}>
                      <Trash2 className="h-4 w-4" aria-hidden />
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
