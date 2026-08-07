import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import { useListarNotificacoesQuery, useMarcarNotificacaoComoLidaMutation } from '@/api/notificacoesApi';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notificacoes = [] } = useListarNotificacoesQuery();
  const [marcarComoLida] = useMarcarNotificacaoComoLidaMutation();

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificações"
        className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-brand-300"
      >
        <Bell className="h-5 w-5" />
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-ink-950">
            {naoLidas}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 animate-pop origin-top-right rounded-2xl border border-slate-100 bg-white shadow-glow dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              Notificações
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Nenhuma notificação por aqui.
                </p>
              )}
              {notificacoes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.lida && marcarComoLida(n.id)}
                  className={`block w-full border-b border-slate-50 px-4 py-3 text-left text-sm transition-colors last:border-0 hover:bg-brand-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                    n.lida ? 'text-slate-500 dark:text-slate-400' : 'font-semibold text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.lida && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />}
                    <div className={n.lida ? 'pl-3.5' : ''}>
                      <p>{n.mensagem}</p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {formatDistanceToNow(new Date(n.dataCriacao), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
