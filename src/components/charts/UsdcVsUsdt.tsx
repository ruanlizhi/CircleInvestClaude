import ReactECharts from 'echarts-for-react';
import { useChartData } from '../../hooks/useChartData';
import { filterByTimeRange, formatCurrency } from '../../utils/format';
import ChartCard from '../ChartCard';
import type { UsdcUsdtPoint, TimeRange } from '../../types';

export default function UsdcVsUsdt() {
  const { data, loading } = useChartData<UsdcUsdtPoint[]>('usdc-usdt-mcap.json');

  if (loading || !data) return <ChartCard title="USDC vs USDT Market Cap">{() => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}</ChartCard>;

  return (
    <ChartCard title="USDC vs USDT Market Cap" subtitle="Head-to-head comparison">
      {(range: TimeRange) => {
        const filtered = filterByTimeRange(data, range);
        return (
          <ReactECharts
            style={{ height: '100%' }}
            option={{
              tooltip: {
                trigger: 'axis',
                formatter: (params: any) => `${params[0].axisValue}<br/>` + params.map((p: any) => `${p.seriesName}: ${formatCurrency(p.value)}`).join('<br/>'),
              },
              legend: { data: ['USDC', 'USDT'], textStyle: { color: '#9ca3af' }, top: 0 },
              grid: { top: 30, right: 15, bottom: 30, left: 70 },
              xAxis: { type: 'category', data: filtered.map(d => d.date), axisLabel: { color: '#6b7280' }, axisLine: { lineStyle: { color: '#2a2b35' } } },
              yAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: (v: number) => formatCurrency(v) }, splitLine: { lineStyle: { color: '#1f2030' } } },
              series: [
                {
                  name: 'USDC',
                  type: 'line',
                  data: filtered.map(d => d.usdcMcap),
                  lineStyle: { color: '#2775ca', width: 2 },
                  itemStyle: { color: '#2775ca' },
                  showSymbol: false,
                  smooth: true,
                },
                {
                  name: 'USDT',
                  type: 'line',
                  data: filtered.map(d => d.usdtMcap),
                  lineStyle: { color: '#26a17b', width: 2 },
                  itemStyle: { color: '#26a17b' },
                  showSymbol: false,
                  smooth: true,
                },
              ],
            }}
          />
        );
      }}
    </ChartCard>
  );
}
