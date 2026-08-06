import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        🔔
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {naoLidas}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">
              Notificações
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notificacoes.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-slate-500">Nenhuma notificação por aqui.</p>
              )}
              {notificacoes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.lida && marcarComoLida(n.id)}
                  className={`block w-full border-b border-slate-50 px-4 py-3 text-left text-sm last:border-0 hover:bg-slate-50 ${
                    n.lida ? 'text-slate-500' : 'font-medium text-slate-900'
                  }`}
                >
                  <p>{n.mensagem}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.dataCriacao), { addSuffix: true, locale: ptBR })}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
