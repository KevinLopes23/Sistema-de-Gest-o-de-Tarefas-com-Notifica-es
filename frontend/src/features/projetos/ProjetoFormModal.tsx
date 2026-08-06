import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, Input, Textarea } from '@/components/ui/Input';
import { useCriarProjetoMutation, useAtualizarProjetoMutation } from '@/api/projetosApi';
import type { ApiProblemDetails, Projeto } from '@/types';

const schema = z.object({
  nome: z.string().min(1, 'Informe o nome do projeto').max(150),
  descricao: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

interface ProjetoFormModalProps {
  open: boolean;
  onClose: () => void;
  projeto?: Projeto | null;
}

export function ProjetoFormModal({ open, onClose, projeto }: ProjetoFormModalProps) {
  const isEditing = Boolean(projeto);
  const [criar, { isLoading: criando }] = useCriarProjetoMutation();
  const [atualizar, { isLoading: atualizando }] = useAtualizarProjetoMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ nome: projeto?.nome ?? '', descricao: projeto?.descricao ?? '' });
  }, [open, projeto, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && projeto) {
        await atualizar({ id: projeto.id, body: data }).unwrap();
        toast.success('Projeto atualizado com sucesso.');
      } else {
        await criar(data).unwrap();
        toast.success('Projeto criado com sucesso.');
      }
      onClose();
    } catch (err) {
      const problem = err as { data?: ApiProblemDetails };
      toast.error(problem.data?.title ?? 'Não foi possível salvar o projeto.');
    }
  };

  return (
    <Modal open={open} title={isEditing ? 'Editar projeto' : 'Novo projeto'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <FieldWrapper label="Nome" htmlFor="nome" error={errors.nome?.message}>
          <Input id="nome" {...register('nome')} />
        </FieldWrapper>

        <FieldWrapper label="Descrição" htmlFor="descricao" error={errors.descricao?.message}>
          <Textarea id="descricao" {...register('descricao')} />
        </FieldWrapper>

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
