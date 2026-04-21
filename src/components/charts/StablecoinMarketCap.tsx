import ReactECharts from 'echarts-for-react';
import { useChartData } from '../../hooks/useChartData';
import { filterByTimeRange, formatCurrency } from '../../utils/format';
import ChartCard from '../ChartCard';
import type { MarketCapPoint, TimeRange } from '../../types';

export default function StablecoinMarketCap() {
  const { data, loading } = useChartData<MarketCapPoint[]>('stablecoin-total-mcap.json');

  if (loading || !data) return <ChartCard title="Stablecoin Total Market Cap">{() => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}</ChartCard>;

  return (
    <ChartCard title="Stablecoin Total Market Cap" subtitle="All stablecoins combined">
      {(range: TimeRange) => {
        const filtered = filterByTimeRange(data, range);
        return (
          <ReactECharts
            style={{ height: '100%' }}
            option={{
              tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                  const p = params[0];
                  return `${p.axisValue}<br/>${formatCurrency(p.value)}`;
                },
              },
              grid: { top: 10, right: 15, bottom: 30, left: 70 },
              xAxis: { type: 'category', data: filtered.map(d => d.date), axisLabel: { color: '#6b7280' }, axisLine: { lineStyle: { color: '#2a2b35' } } },
              yAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: (v: number) => formatCurrency(v) }, splitLine: { lineStyle: { color: '#1f2030' } } },
              series: [{
                type: 'line',
                data: filtered.map(d => d.totalMcap),
                areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }] } },
                lineStyle: { color: '#3b82f6', width: 2 },
                itemStyle: { color: '#3b82f6' },
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
