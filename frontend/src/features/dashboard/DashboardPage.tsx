import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useObterMetricasQuery } from '@/api/dashboardApi';

const statusLabels: Record<string, string> = {
  Pendente: 'Pendente',
  EmAndamento: 'Em Andamento',
  Concluida: 'Concluída',
  Cancelada: 'Cancelada',
};

const statusColors: Record<string, string> = {
  Pendente: '#94a3b8',
  EmAndamento: '#3b82f6',
  Concluida: '#22c55e',
  Cancelada: '#ef4444',
};

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function DashboardPage() {
  const { data: metricas, isLoading } = useObterMetricasQuery();

  if (isLoading || !metricas) return <FullPageSpinner />;

  const statusData = Object.entries(metricas.totalPorStatus).map(([status, total]) => ({
    status,
    label: statusLabels[status] ?? status,
    total,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral do andamento das tarefas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de tarefas" value={metricas.totalTarefas} />
        <StatCard label="Tarefas atrasadas" value={metricas.tarefasAtrasadas} />
        <StatCard label="Concluídas no prazo" value={metricas.tarefasConcluidasNoPrazo} />
        <StatCard label="Taxa de conclusão" value={`${metricas.taxaConclusao}%`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Tarefas por status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status] ?? '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Distribuição por status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="total" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status] ?? '#8b5cf6'} />
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
