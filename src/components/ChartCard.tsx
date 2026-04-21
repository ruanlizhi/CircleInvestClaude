import { useState, type ReactNode } from 'react';
import type { TimeRange } from '../types';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: (timeRange: TimeRange) => ReactNode;
}

const ranges: TimeRange[] = ['1M', '3M', '1Y', 'ALL'];

export default function ChartCard({ title, subtitle, children }: ChartCardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');

  return (
    <div className="bg-[#1a1b23] rounded-xl border border-[#2a2b35] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white text-base font-medium">{title}</h3>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                timeRange === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#252630] text-gray-400 hover:text-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[280px]">
        {children(timeRange)}
      </div>
    </div>
  );
}
