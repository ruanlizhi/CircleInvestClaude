import ReactECharts from 'echarts-for-react';
import { useChartData } from '../../hooks/useChartData';
import { filterByTimeRange, formatCurrency, dataZoomConfig } from '../../utils/format';
import ChartCard from '../ChartCard';
import type { UsdcUsdtPoint, TimeRange } from '../../types';

export default function UsdcVsUsdt() {
  const { data, loading } = useChartData<UsdcUsdtPoint[]>('usdc-usdt-mcap.json');

  if (loading || !data) return <ChartCard title="USDC vs USDT Market Cap">{() => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}</ChartCard>;

  return (
    <ChartCard title="USDC vs USDT Market Cap" subtitle="Head-to-head comparison" source="DefiLlama">
      {(range: TimeRange) => {
        const filtered = filterByTimeRange(data, range);
        return (
          <ReactECharts
            style={{ height: '100%' }}
            option={{
              tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                  let text = params[0].axisValue;
                  for (const p of params) {
                    if (p.seriesName === 'USDC/USDT') {
                      text += `<br/>${p.marker}${p.seriesName}: ${p.value.toFixed(2)}%`;
                    } else {
                      text += `<br/>${p.marker}${p.seriesName}: ${formatCurrency(p.value)}`;
                    }
                  }
                  return text;
                },
              },
              legend: { data: ['USDC', 'USDT', 'USDC/USDT'], textStyle: { color: '#9ca3af' }, top: 0 },
              dataZoom: dataZoomConfig,
              grid: { top: 30, right: 55, bottom: 55, left: 70 },
              xAxis: { type: 'category', data: filtered.map(d => d.date), axisLabel: { color: '#6b7280' }, axisLine: { lineStyle: { color: '#2a2b35' } } },
              yAxis: [
                { type: 'value', axisLabel: { color: '#6b7280', formatter: (v: number) => formatCurrency(v) }, splitLine: { lineStyle: { color: '#1f2030' } } },
                { type: 'value', position: 'right', axisLabel: { color: '#f97316', fontSize: 10, formatter: '{value}%' }, splitLine: { show: false }, axisLine: { lineStyle: { color: '#f97316' } } },
              ],
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
                {
                  name: 'USDC/USDT',
                  type: 'line',
                  yAxisIndex: 1,
                  data: filtered.map(d => d.usdtMcap ? +((d.usdcMcap / d.usdtMcap) * 100).toFixed(2) : null),
                  lineStyle: { color: '#f97316', width: 1.5, type: 'dashed' },
                  itemStyle: { color: '#f97316' },
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
