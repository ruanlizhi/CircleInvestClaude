export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
}

export interface MarketCapPoint extends TimeSeriesPoint {
  totalMcap: number;
}

export interface UsdcUsdtPoint extends TimeSeriesPoint {
  usdcMcap: number;
  usdtMcap: number;
}

export interface MarketSharePoint extends TimeSeriesPoint {
  sharePercent: number;
  usdtSharePercent: number;
}

export interface TreasuryRatePoint extends TimeSeriesPoint {
  rate: number;
}

export interface VolumePoint extends TimeSeriesPoint {
  volume: number;
}

export interface RevenuePoint extends TimeSeriesPoint {
  revenue: number;
}

export interface CurrentMetrics {
  totalMcap: number;
  usdcMcap: number;
  usdtMcap: number;
  sharePercent: number;
  rate: number | null;
  revenue: number | null;
  updatedAt: string;
}

export type TimeRange = '1M' | '3M' | '1Y' | 'ALL';
