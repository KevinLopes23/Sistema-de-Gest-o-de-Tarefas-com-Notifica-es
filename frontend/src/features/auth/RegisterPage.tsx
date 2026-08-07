import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import moovefyLogo from '@/assets/moovefy-logo.png';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, Input, PasswordInput } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6 dark:bg-ink-950">
      <ThemeToggle className="fixed right-4 top-4 z-10 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80" />

      <div
        className="absolute -right-32 -top-32 h-96 w-96 animate-blob rounded-full bg-gradient-to-br from-brand-200 to-brand-400 opacity-40 blur-3xl dark:opacity-20"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -left-32 h-96 w-96 animate-blob rounded-full bg-brand-100 opacity-60 blur-3xl [animation-delay:-5s] dark:opacity-20"
        aria-hidden
      />

      <div className="relative w-full max-w-sm animate-fade-in-up rounded-3xl bg-white p-8 shadow-glow-lg dark:bg-slate-900">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-800 dark:to-slate-800">
            <img src={moovefyLogo} alt="" className="h-7 w-7" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Moovefy <span className="text-brand-600 dark:text-brand-400">Tasks</span>
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Criar conta</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece a organizar as tarefas da sua equipe.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
          <FieldWrapper label="Nome" htmlFor="nome" error={errors.nome?.message}>
            <Input id="nome" autoComplete="name" {...register('nome')} />
          </FieldWrapper>

          <FieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
          </FieldWrapper>

          <FieldWrapper label="Senha" htmlFor="senha" error={errors.senha?.message}>
            <PasswordInput id="senha" autoComplete="new-password" {...register('senha')} />
          </FieldWrapper>

          <Button type="submit" loading={isLoading} className="mt-2 w-full">
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
