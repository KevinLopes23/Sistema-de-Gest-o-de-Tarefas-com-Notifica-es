import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ClipboardList, TimerReset, CircleCheckBig, TrendingUp, type LucideIcon } from 'lucide-react';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useObterMetricasQuery } from '@/api/dashboardApi';
import { useTheme } from '@/app/ThemeProvider';

const statusLabels: Record<string, string> = {
  Pendente: 'Pendente',
  EmAndamento: 'Em Andamento',
  Concluida: 'Concluída',
  Cancelada: 'Cancelada',
};

const statusColors: Record<string, string> = {
  Pendente: '#94a3b8',
  EmAndamento: '#3b82f6',
  Concluida: '#0d9f6e',
  Cancelada: '#ef4444',
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  index,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  index: number;
}) {
  return (
    <div
      className="group animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-500/20">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

export function DashboardPage() {
  const { data: metricas, isLoading } = useObterMetricasQuery();
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  if (isLoading || !metricas) return <FullPageSpinner />;

  const statusData = Object.entries(metricas.totalPorStatus).map(([status, total]) => ({
    status,
    label: statusLabels[status] ?? status,
    total,
  }));

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500 dark:text-brand-400">// visão geral</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhe o andamento das tarefas da sua equipe.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de tarefas" value={metricas.totalTarefas} icon={ClipboardList} index={0} />
        <StatCard label="Tarefas atrasadas" value={metricas.tarefasAtrasadas} icon={TimerReset} index={1} />
        <StatCard label="Concluídas no prazo" value={metricas.tarefasConcluidasNoPrazo} icon={CircleCheckBig} index={2} />
        <StatCard label="Taxa de conclusão" value={`${metricas.taxaConclusao}%`} icon={TrendingUp} index={3} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 [animation-delay:120ms] dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Tarefas por status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: tickColor }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} />
              <Tooltip cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }} />
              <Bar dataKey="total" radius={[8, 8, 0, 0]} animationDuration={600}>
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status] ?? '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 [animation-delay:180ms] dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Distribuição por status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="total"
                nameKey="label"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                isAnimationActive={false}
                cornerRadius={6}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status] ?? '#8b5cf6'} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
