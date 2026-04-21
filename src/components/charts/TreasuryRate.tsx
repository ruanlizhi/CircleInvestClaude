import ReactECharts from 'echarts-for-react';
import { useChartData } from '../../hooks/useChartData';
import { filterByTimeRange } from '../../utils/format';
import ChartCard from '../ChartCard';
import type { TreasuryRatePoint, TimeRange } from '../../types';

export default function TreasuryRate() {
  const { data, loading } = useChartData<TreasuryRatePoint[]>('treasury-rate.json');

  if (loading || !data) return <ChartCard title="US 3-Month Treasury Rate">{() => <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>}</ChartCard>;

  if (data.length === 0) {
    return (
      <ChartCard title="US 3-Month Treasury Rate" subtitle="FRED DGS3MO">
        {() => <div className="flex items-center justify-center h-full text-gray-500">No data — FRED API key not configured</div>}
      </ChartCard>
    );
  }

  return (
    <ChartCard title="US 3-Month Treasury Rate" subtitle="FRED DGS3MO — Circle's revenue driver">
      {(range: TimeRange) => {
        const filtered = filterByTimeRange(data, range);
        return (
          <ReactECharts
            style={{ height: '100%' }}
            option={{
              tooltip: {
                trigger: 'axis',
                formatter: (params: any) => `${params[0].axisValue}<br/>${params[0].value.toFixed(2)}%`,
              },
              grid: { top: 10, right: 15, bottom: 30, left: 55 },
              xAxis: { type: 'category', data: filtered.map(d => d.date), axisLabel: { color: '#6b7280' }, axisLine: { lineStyle: { color: '#2a2b35' } } },
              yAxis: { type: 'value', axisLabel: { color: '#6b7280', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#1f2030' } } },
              series: [{
                type: 'line',
                data: filtered.map(d => d.rate),
                lineStyle: { color: '#f59e0b', width: 2 },
                itemStyle: { color: '#f59e0b' },
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
