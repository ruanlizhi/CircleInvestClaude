import ReactECharts from 'echarts-for-react';
import { useChartData } from '../../hooks/useChartData';
import { filterByTimeRange } from '../../utils/format';
import ChartCard from '../ChartCard';
import type { MarketSharePoint, TimeRange } from '../../types';

const EVENTS = [
  { date: '2023-01-01', label: 'MiCA Framework' },
  { date: '2024-06-30', label: 'MiCA Effective' },
  { date: '2025-02-04', label: 'GENIUS Act Intro' },
];

export default function UsdcMarketShare() {
  const { data, loading } = useChartData<MarketSharePoint[]>('usdc-market-share.json');

  if (loading || !data) return <ChartCard title="Market Share">{() => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}</ChartCard>;

  return (
    <ChartCard title="USDC vs USDT Market Share" subtitle="% of total stablecoin market cap" source="DefiLlama">
      {(range: TimeRange) => {
        const filtered = filterByTimeRange(data, range);
        const eventMap = new Map(EVENTS.map(e => [e.date, e.label]));

        return (
          <ReactECharts
            style={{ height: '100%' }}
            option={{
              tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                  const date = params[0].axisValue;
                  const event = eventMap.get(date);
                  let text = `${date}`;
                  for (const p of params) {
                    text += `<br/>${p.seriesName}: ${p.value.toFixed(2)}%`;
                  }
                  if (event) text += `<br/><span style="color:#f59e0b">⚡ ${event}</span>`;
                  return text;
                },
              },
              legend: { data: ['USDC', 'USDT'], textStyle: { color: '#9ca3af' }, top: 0 },
              grid: { top: 30, right: 15, bottom: 30, left: 55 },
              xAxis: { type: 'category', data: filtered.map(d => d.date), axisLabel: { color: '#6b7280' }, axisLine: { lineStyle: { color: '#2a2b35' } } },
              yAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#1f2030' } } },
              series: [
                {
                  name: 'USDC',
                  type: 'line',
                  data: filtered.map(d => d.sharePercent),
                  lineStyle: { color: '#2775ca', width: 2 },
                  itemStyle: { color: '#2775ca' },
                  showSymbol: false,
                  smooth: true,
                },
                {
                  name: 'USDT',
                  type: 'line',
                  data: filtered.map(d => d.usdtSharePercent),
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
