import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import moovefyLogo from '@/assets/moovefy-logo.png';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, Input } from '@/components/ui/Input';
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
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-500 to-teal-400 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <img src={moovefyLogo} alt="Moovefy" className="h-9 w-9 brightness-0 invert" />
          <span className="text-xl font-semibold">Moovefy Tasks</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            Gestão de tarefas em equipe,
            <br />
            com notificações em tempo real.
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Organize projetos, acompanhe prazos e mantenha seu time alinhado com atualizações instantâneas.
          </p>
        </div>
        <p className="text-xs text-white/60">Sistema de Gestão de Tarefas · Moovefy</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <img src={moovefyLogo} alt="Moovefy" className="h-8 w-8" />
            <span className="text-lg font-semibold text-slate-900">Moovefy Tasks</span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Entrar</h2>
          <p className="mt-1 text-sm text-slate-500">Acesse sua conta para continuar.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            <FieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" placeholder="voce@empresa.com" {...register('email')} />
            </FieldWrapper>

            <FieldWrapper label="Senha" htmlFor="senha" error={errors.senha?.message}>
              <Input id="senha" type="password" autoComplete="current-password" {...register('senha')} />
            </FieldWrapper>

            <Button type="submit" loading={isLoading} className="mt-2 w-full">
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Não tem uma conta?{' '}
            <Link to="/registrar" className="font-medium text-brand-600 hover:text-brand-700">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-6 rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-500">
            Credenciais de teste: <strong>admin@moovefy.com</strong> / <strong>Admin@123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
