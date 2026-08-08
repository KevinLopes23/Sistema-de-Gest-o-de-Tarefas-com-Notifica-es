import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import moovefyLogo from '@/assets/moovefy-logo.png';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, Input, PasswordInput } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useLoginMutation } from '@/api/authApi';
import { useAppDispatch } from '@/app/hooks';
import { credenciaisRecebidas } from './authSlice';
import type { ApiProblemDetails } from '@/types';

const schema = z.object({
  email: z.string().min(1, 'Informe o email').email('Email inválido'),
  senha: z.string().min(1, 'Informe a senha'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const auth = await login(data).unwrap();
      dispatch(credenciaisRecebidas(auth));
      navigate('/dashboard');
    } catch (err) {
      const problem = err as { data?: ApiProblemDetails };
      toast.error(problem.data?.title ?? 'Não foi possível entrar. Verifique suas credenciais.');
    }
  };

  return (
    <div className="flex min-h-screen animate-page-in bg-slate-50 dark:bg-ink-950">
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle className="bg-white/80 backdrop-blur-sm dark:bg-slate-900/80" />
      </div>

      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-ink-950 p-10 text-white lg:flex">
        <div
          className="absolute -right-24 -top-24 h-96 w-96 animate-blob rounded-full bg-gradient-to-br from-brand-500 to-brand-700 opacity-40 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-16 h-80 w-80 animate-blob rounded-full bg-brand-600 opacity-30 blur-3xl [animation-delay:-4s]"
          aria-hidden
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <img src={moovefyLogo} alt="" className="h-7 w-7" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Moovefy Tasks</span>
        </div>

        <div className="relative">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-300">// gestão de equipes</p>
          <h1 className="text-4xl font-extrabold leading-tight">
            Tecnologia que move
            <br />o seu <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">time</span>.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/70">
            Organize projetos, acompanhe prazos e mantenha sua equipe alinhada com notificações em tempo real.
          </p>
        </div>

        <p className="relative text-xs text-white/40">Sistema de Gestão de Tarefas · Moovefy</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-800 dark:to-slate-800">
              <img src={moovefyLogo} alt="" className="h-7 w-7" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Moovefy <span className="text-brand-600 dark:text-brand-400">Tasks</span>
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Entrar</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Acesse sua conta para continuar.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            <FieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" placeholder="voce@empresa.com" {...register('email')} />
            </FieldWrapper>

            <FieldWrapper label="Senha" htmlFor="senha" error={errors.senha?.message}>
              <PasswordInput id="senha" autoComplete="current-password" {...register('senha')} />
            </FieldWrapper>

            <Button type="submit" loading={isLoading} className="mt-2 w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Não tem uma conta?{' '}
            <Link to="/registrar" className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-6 rounded-xl bg-brand-50/70 px-4 py-3 text-xs text-brand-800 ring-1 ring-inset ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">
            Credenciais de teste: <strong>admin@moovefy.com</strong> / <strong>Admin@123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
