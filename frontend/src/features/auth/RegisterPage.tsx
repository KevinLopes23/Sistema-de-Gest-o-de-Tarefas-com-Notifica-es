import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import moovefyLogo from '@/assets/moovefy-logo.png';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, Input } from '@/components/ui/Input';
import { useRegistrarMutation } from '@/api/authApi';
import { useAppDispatch } from '@/app/hooks';
import { credenciaisRecebidas } from './authSlice';
import type { ApiProblemDetails } from '@/types';

const schema = z.object({
  nome: z.string().min(1, 'Informe seu nome'),
  email: z.string().min(1, 'Informe o email').email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registrar, { isLoading }] = useRegistrarMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await registrar(data).unwrap();
      dispatch(credenciaisRecebidas(auth));
      navigate('/dashboard');
    } catch (err) {
      const problem = err as { data?: ApiProblemDetails };
      toast.error(problem.data?.title ?? 'Não foi possível criar a conta.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <img src={moovefyLogo} alt="Moovefy" className="h-8 w-8" />
          <span className="text-lg font-semibold text-slate-900">Moovefy Tasks</span>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900">Criar conta</h2>
        <p className="mt-1 text-sm text-slate-500">Comece a organizar as tarefas da sua equipe.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
          <FieldWrapper label="Nome" htmlFor="nome" error={errors.nome?.message}>
            <Input id="nome" autoComplete="name" {...register('nome')} />
          </FieldWrapper>

          <FieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </FieldWrapper>

          <FieldWrapper label="Senha" htmlFor="senha" error={errors.senha?.message}>
            <Input id="senha" type="password" autoComplete="new-password" {...register('senha')} />
          </FieldWrapper>

          <Button type="submit" loading={isLoading} className="mt-2 w-full">
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
