import { useChartData } from '../hooks/useChartData';
import { formatCurrency, formatPercent, formatRate } from '../utils/format';
import type { CurrentMetrics } from '../types';

interface MetricCardProps {
  label: string;
  value: string;
  color: string;
}

function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <div className="bg-[#1a1b23] rounded-xl border border-[#2a2b35] p-4 text-center">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default function MetricCards() {
  const { data, loading } = useChartData<CurrentMetrics>('current-metrics.json');

  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#1a1b23] rounded-xl border border-[#2a2b35] p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <MetricCard label="Stablecoin Total" value={formatCurrency(data.totalMcap)} color="text-blue-400" />
      <MetricCard label="USDC Market Cap" value={formatCurrency(data.usdcMcap)} color="text-blue-300" />
      <MetricCard label="USDC Share" value={formatPercent(data.sharePercent)} color="text-cyan-400" />
      <MetricCard label="Treasury Rate" value={data.rate !== null ? formatRate(data.rate) : 'N/A'} color="text-amber-400" />
      <MetricCard label="Est. Revenue" value={data.revenue !== null ? formatCurrency(data.revenue) : 'N/A'} color="text-emerald-400" />
    </div>
  );
}
