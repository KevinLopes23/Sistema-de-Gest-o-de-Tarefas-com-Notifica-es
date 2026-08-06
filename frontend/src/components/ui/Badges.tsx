import clsx from 'clsx';
import type { Prioridade, StatusTarefa } from '@/types';

const statusConfig: Record<StatusTarefa, { label: string; className: string }> = {
  Pendente: { label: 'Pendente', className: 'bg-slate-100 text-slate-700' },
  EmAndamento: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-700' },
  Concluida: { label: 'Concluída', className: 'bg-green-100 text-green-700' },
  Cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
};

export function StatusBadge({ status }: { status: StatusTarefa }) {
  const config = statusConfig[status];
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}

const prioridadeConfig: Record<Prioridade, { label: string; className: string }> = {
  Baixa: { label: 'Baixa', className: 'bg-slate-100 text-slate-600' },
  Media: { label: 'Média', className: 'bg-amber-100 text-amber-700' },
  Alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
  Urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
};

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const config = prioridadeConfig[prioridade];
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}

export function AtrasadaBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
      ⚠ Atrasada
    </span>
  );
}
