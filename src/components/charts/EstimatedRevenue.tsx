import ReactECharts from 'echarts-for-react';
import { useChartData } from '../../hooks/useChartData';
import { filterByTimeRange, formatCurrency } from '../../utils/format';
import ChartCard from '../ChartCard';
import type { RevenuePoint, TimeRange } from '../../types';

export default function EstimatedRevenue() {
  const { data, loading } = useChartData<RevenuePoint[]>('estimated-revenue.json');

  if (loading || !data) return <ChartCard title="Circle Estimated Annual Revenue">{() => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}</ChartCard>;

  if (data.length === 0) {
    return (
      <ChartCard title="Circle Estimated Annual Revenue" subtitle="USDC MCap x Rate x 50%">
        {() => <div className="flex items-center justify-center h-full text-gray-500">No data — requires FRED API key for treasury rate</div>}
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Circle Estimated Annual Revenue" subtitle="USDC MCap x Treasury Rate x 50% (net of Coinbase split)" source="DefiLlama + FRED (calculated)">
      {(range: TimeRange) => {
        const filtered = filterByTimeRange(data, range);
        return (
          <ReactECharts
            style={{ height: '100%' }}
            option={{
              tooltip: {
                trigger: 'axis',
                formatter: (params: any) => `${params[0].axisValue}<br/>${formatCurrency(params[0].value)}`,
              },
              grid: { top: 10, right: 15, bottom: 30, left: 70 },
              xAxis: { type: 'category', data: filtered.map(d => d.date), axisLabel: { color: '#6b7280' }, axisLine: { lineStyle: { color: '#2a2b35' } } },
              yAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: (v: number) => formatCurrency(v) }, splitLine: { lineStyle: { color: '#1f2030' } } },
              series: [{
                type: 'line',
                data: filtered.map(d => d.revenue),
                areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }] } },
                lineStyle: { color: '#10b981', width: 2 },
                itemStyle: { color: '#10b981' },
                showSymbol: false,
                smooth: true,
              }],
            }}
          />
        );
      }}
    </ChartCard>
  );
}
