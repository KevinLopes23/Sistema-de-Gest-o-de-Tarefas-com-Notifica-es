import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, Input, Select, Textarea } from '@/components/ui/Input';
import { useCriarTarefaMutation, useAtualizarTarefaMutation } from '@/api/tarefasApi';
import { useListarProjetosQuery } from '@/api/projetosApi';
import { useListarUsuariosQuery } from '@/api/usuariosApi';
import type { ApiProblemDetails, Prioridade, Tarefa } from '@/types';

const schema = z.object({
  titulo: z.string().min(1, 'Informe o título').max(200),
  descricao: z.string().max(4000).optional(),
  prioridade: z.enum(['Baixa', 'Media', 'Alta', 'Urgente']),
  projetoId: z.string().refine((v) => Number(v) > 0, 'Selecione um projeto'),
  dataPrazo: z.string().min(1, 'Informe o prazo'),
  responsavelId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TarefaFormModalProps {
  open: boolean;
  onClose: () => void;
  tarefa?: Tarefa | null;
  projetoIdPadrao?: number;
}

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function TarefaFormModal({ open, onClose, tarefa, projetoIdPadrao }: TarefaFormModalProps) {
  const isEditing = Boolean(tarefa);
  const { data: projetos = [] } = useListarProjetosQuery();
  const { data: usuarios = [] } = useListarUsuariosQuery();
  const [criar, { isLoading: criando }] = useCriarTarefaMutation();
  const [atualizar, { isLoading: atualizando }] = useAtualizarTarefaMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset({
      titulo: tarefa?.titulo ?? '',
      descricao: tarefa?.descricao ?? '',
      prioridade: tarefa?.prioridade ?? 'Media',
      projetoId: String(tarefa?.projetoId ?? projetoIdPadrao ?? 0),
      dataPrazo: toDatetimeLocalValue(tarefa?.dataPrazo) || toDatetimeLocalValue(new Date().toISOString()),
      responsavelId: tarefa?.responsavelId ? String(tarefa.responsavelId) : '',
    });
  }, [open, tarefa, projetoIdPadrao, reset]);

  const onSubmit = async (data: FormData) => {
    const body = {
      titulo: data.titulo,
      descricao: data.descricao || null,
      prioridade: data.prioridade as Prioridade,
      dataPrazo: new Date(data.dataPrazo).toISOString(),
      responsavelId: data.responsavelId ? Number(data.responsavelId) : null,
    };

    try {
      if (isEditing && tarefa) {
        await atualizar({ id: tarefa.id, body }).unwrap();
        toast.success('Tarefa atualizada com sucesso.');
      } else {
        await criar({ ...body, projetoId: Number(data.projetoId) }).unwrap();
        toast.success('Tarefa criada com sucesso.');
      }
      onClose();
    } catch (err) {
      const problem = err as { data?: ApiProblemDetails };
      toast.error(problem.data?.title ?? 'Não foi possível salvar a tarefa.');
    }
  };

  return (
    <Modal open={open} title={isEditing ? 'Editar tarefa' : 'Nova tarefa'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Título" htmlFor="titulo" error={errors.titulo?.message}>
          <Input id="titulo" {...register('titulo')} />
        </FieldWrapper>

        <FieldWrapper label="Descrição" htmlFor="descricao" error={errors.descricao?.message}>
          <Textarea id="descricao" {...register('descricao')} />
        </FieldWrapper>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="Projeto" htmlFor="projetoId" error={errors.projetoId?.message}>
            <Select id="projetoId" disabled={isEditing} {...register('projetoId')}>
              <option value="0">Selecione…</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
          </FieldWrapper>

          <FieldWrapper label="Prioridade" htmlFor="prioridade" error={errors.prioridade?.message}>
            <Select id="prioridade" {...register('prioridade')}>
              <option value="Baixa">Baixa</option>
              <option value="Media">Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </Select>
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="Prazo" htmlFor="dataPrazo" error={errors.dataPrazo?.message}>
            <Input id="dataPrazo" type="datetime-local" {...register('dataPrazo')} />
          </FieldWrapper>

          <FieldWrapper label="Responsável" htmlFor="responsavelId" error={errors.responsavelId?.message}>
            <Select id="responsavelId" {...register('responsavelId')}>
              <option value="">Sem responsável</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={criando || atualizando}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
