export function formatCurrency(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatRate(value: number): string {
  return `${value.toFixed(2)}%`;
}

export const dataZoomConfig = [
  {
    type: 'slider',
    start: 0,
    end: 100,
    height: 20,
    bottom: 6,
    borderColor: '#2a2b35',
    backgroundColor: '#1a1b23',
    fillerColor: 'rgba(59,130,246,0.15)',
    handleStyle: { color: '#3b82f6', borderColor: '#3b82f6' },
    dataBackground: {
      lineStyle: { color: '#2a2b35' },
      areaStyle: { color: '#1f2030' },
    },
    selectedDataBackground: {
      lineStyle: { color: '#3b82f6' },
      areaStyle: { color: 'rgba(59,130,246,0.1)' },
    },
    textStyle: { color: '#6b7280', fontSize: 10 },
    moveHandleSize: 5,
  },
];

export function filterByTimeRange<T extends { date: string }>(
  data: T[],
  range: string
): T[] {
  if (range === 'ALL') return data;

  const now = new Date();
  let cutoff: Date;
  switch (range) {
    case '1M':
      cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3M':
      cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '1Y':
      cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      return data;
  }

  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return data.filter(d => d.date >= cutoffStr);
}
