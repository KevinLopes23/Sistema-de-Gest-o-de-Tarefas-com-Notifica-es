import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';
import type { Prioridade, StatusTarefa } from '@/types';

const statusConfig: Record<StatusTarefa, { label: string; className: string; dot: string }> = {
  Pendente: {
    label: 'Pendente',
    className: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  },
  EmAndamento: {
    label: 'Em Andamento',
    className: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30',
    dot: 'bg-blue-500',
  },
  Concluida: {
    label: 'Concluída',
    className:
      'bg-mint-100 text-mint-600 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    dot: 'bg-mint-600',
  },
  Cancelada: {
    label: 'Cancelada',
    className: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    dot: 'bg-red-500',
  },
};

export function StatusBadge({ status }: { status: StatusTarefa }) {
  const config = statusConfig[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset',
        config.className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', config.dot)} aria-hidden />
      {config.label}
    </span>
  );
}

const prioridadeConfig: Record<Prioridade, { label: string; className: string }> = {
  Baixa: { label: 'Baixa', className: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700' },
  Media: { label: 'Média', className: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30' },
  Alta: { label: 'Alta', className: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30' },
  Urgente: { label: 'Urgente', className: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30' },
};

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const config = prioridadeConfig[prioridade];
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export function AtrasadaBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30">
      <AlertTriangle className="h-3 w-3" aria-hidden />
      Atrasada
    </span>
  );
}
