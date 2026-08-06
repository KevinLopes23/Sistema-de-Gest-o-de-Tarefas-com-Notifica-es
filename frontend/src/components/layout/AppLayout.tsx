import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import moovefyLogo from '@/assets/moovefy-logo.png';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useSignalRNotifications } from '@/features/notifications/useSignalRNotifications';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/projetos', label: 'Projetos', icon: '📁' },
  { to: '/tarefas', label: 'Tarefas', icon: '✅' },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const usuario = useAppSelector((state) => state.auth.usuario);
  const dispatch = useAppDispatch();

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
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white py-6 md:flex">
        <div className="mb-6 flex items-center gap-2 px-5">
          <img src={moovefyLogo} alt="Moovefy" className="h-8 w-8" />
          <span className="text-lg font-semibold text-slate-900">Moovefy Tasks</span>
        </div>
        {navLinks}
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white py-6 shadow-xl">
            <div className="mb-6 flex items-center gap-2 px-5">
              <img src={moovefyLogo} alt="Moovefy" className="h-8 w-8" />
              <span className="text-lg font-semibold text-slate-900">Moovefy Tasks</span>
            </div>
            {navLinks}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <button
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-900">{usuario?.nome}</p>
                <p className="text-xs text-slate-500">{usuario?.email}</p>
              </div>
              <button
                onClick={() => dispatch(logout())}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
