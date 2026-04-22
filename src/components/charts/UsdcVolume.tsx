import ReactECharts from 'echarts-for-react';
import { useChartData } from '../../hooks/useChartData';
import { filterByTimeRange, formatCurrency } from '../../utils/format';
import ChartCard from '../ChartCard';
import type { VolumePoint, TimeRange } from '../../types';

export default function UsdcVolume() {
  const { data, loading } = useChartData<VolumePoint[]>('usdc-volume.json');

  if (loading || !data) return <ChartCard title="USDC Daily Volume">{() => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}</ChartCard>;

  return (
    <ChartCard title="USDC Daily Volume" subtitle="24h trading volume" source="CoinGecko">
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
                type: 'bar',
                data: filtered.map(d => d.volume),
                itemStyle: { color: '#6366f1' },
              }],
            }}
          />
        );
      }}
    </ChartCard>
  );
}
