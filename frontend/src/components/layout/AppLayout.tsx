import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { FolderKanban, LayoutDashboard, ListChecks, LogOut, Menu } from 'lucide-react';
import moovefyLogo from '@/assets/moovefy-logo.png';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSignalRNotifications } from '@/features/notifications/useSignalRNotifications';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban },
  { to: '/tarefas', label: 'Tarefas', icon: ListChecks },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const usuario = useAppSelector((state) => state.auth.usuario);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useSignalRNotifications();

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25'
                : 'text-slate-600 hover:translate-x-0.5 hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300',
            )
          }
        >
          <item.icon className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const logoBlock = (
    <div className="mb-6 flex items-center gap-2.5 px-5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-800 dark:to-slate-800">
        <img src={moovefyLogo} alt="" className="h-7 w-7 drop-shadow-sm" />
      </div>
      <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
        Moovefy <span className="text-brand-600 dark:text-brand-400">Tasks</span>
      </span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-ink-950">
      {/* Sidebar desktop */}
      <aside
        data-testid="sidebar-desktop"
        className="hidden w-64 flex-col border-r border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-ink-900 md:flex"
      >
        {logoBlock}
        {navLinks}
        <div className="mx-3 mt-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white shadow-glow">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">// dica</p>
          <p className="mt-1 text-sm font-semibold leading-snug">
            Organize seus projetos e acompanhe prazos em tempo real.
          </p>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 animate-fade-in md:hidden">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside
            data-testid="sidebar-mobile"
            className="absolute left-0 top-0 flex h-full w-64 animate-pop flex-col bg-white py-6 shadow-glow-lg [animation-duration:250ms] dark:bg-ink-900"
          >
            {logoBlock}
            {navLinks}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-ink-950/80 md:px-6">
          <button
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{usuario?.nome}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{usuario?.email}</p>
              </div>
              <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-extrabold text-white sm:flex">
                {usuario?.nome?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm font-bold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
