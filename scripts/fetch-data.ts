import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'public', 'data');
const FRED_API_KEY = process.env.FRED_API_KEY || '';

const USDC_ID = 2;
const USDT_ID = 1;

function toDateStr(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

function writeJson(filename: string, data: unknown) {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data));
  console.log(`  Written: ${filename}`);
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function fetchStablecoinOverview() {
  console.log('Fetching stablecoin overview...');
  const data = await fetchJson('https://stablecoins.llama.fi/stablecoins?includePrices=true');
  const assets = data.peggedAssets;
  const usdc = assets.find((a: any) => a.symbol === 'USDC');
  const usdt = assets.find((a: any) => a.symbol === 'USDT');
  const totalMcap = assets.reduce((sum: number, a: any) => sum + (a.circulating?.peggedUSD || 0), 0);
  console.log(`  Total: $${(totalMcap / 1e9).toFixed(1)}B, USDC: $${((usdc?.circulating?.peggedUSD || 0) / 1e9).toFixed(1)}B`);
  return {
    totalMcap,
    usdcMcap: usdc?.circulating?.peggedUSD || 0,
    usdtMcap: usdt?.circulating?.peggedUSD || 0,
  };
}

async function fetchStablecoinHistory(id: number): Promise<Array<{ date: string; mcap: number }>> {
  console.log(`Fetching history for stablecoin id=${id}...`);
  const data = await fetchJson(`https://stablecoins.llama.fi/stablecoin/${id}`);

  if (data.tokens && data.tokens.length > 0) {
    const entries = data.tokens.map((t: any) => ({
      date: toDateStr(t.date),
      mcap: t.circulating?.peggedUSD || 0,
    }));
    console.log(`  Got ${entries.length} data points`);
    return entries;
  }

  if (data.chainBalances) {
    const dateMap = new Map<string, number>();
    for (const chain of Object.values(data.chainBalances) as any[]) {
      if (!chain.tokens) continue;
      for (const t of chain.tokens) {
        const d = toDateStr(t.date);
        dateMap.set(d, (dateMap.get(d) || 0) + (t.circulating?.peggedUSD || 0));
      }
    }
    const entries = Array.from(dateMap.entries())
      .map(([date, mcap]) => ({ date, mcap }))
      .sort((a, b) => a.date.localeCompare(b.date));
    console.log(`  Got ${entries.length} data points (aggregated from chains)`);
    return entries;
  }

  return [];
}

async function fetchTotalMcapHistory(): Promise<Array<{ date: string; totalMcap: number }>> {
  console.log('Fetching total stablecoin market cap history...');
  try {
    const data = await fetchJson('https://stablecoins.llama.fi/stablecoincharts/all');
    const entries = data.map((entry: any) => ({
      date: toDateStr(parseInt(entry.date)),
      totalMcap: entry.totalCirculatingUSD?.peggedUSD || 0,
    }));
    console.log(`  Got ${entries.length} data points`);
    return entries;
  } catch (e: any) {
    console.log(`  Failed: ${e.message}`);
    return [];
  }
}

async function fetchTreasuryRate(): Promise<Array<{ date: string; rate: number }>> {
  if (!FRED_API_KEY) {
    console.log('FRED_API_KEY not set, skipping treasury rate');
    return [];
  }
  console.log('Fetching treasury rate from FRED...');
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DGS3MO&api_key=${FRED_API_KEY}&file_type=json&observation_start=2019-01-01`;
  const data = await fetchJson(url);
  const entries = data.observations
    .filter((o: any) => o.value !== '.')
    .map((o: any) => ({ date: o.date, rate: parseFloat(o.value) }));
  console.log(`  Got ${entries.length} data points`);
  return entries;
}

async function fetchUsdcVolume(): Promise<Array<{ date: string; volume: number }>> {
  console.log('Fetching USDC volume from CoinGecko...');
  // CoinGecko blocks Node.js native fetch, use curl
  const raw = execSync(
    'curl -s "https://api.coingecko.com/api/v3/coins/usd-coin/market_chart?vs_currency=usd&days=365"',
    { encoding: 'utf-8', timeout: 30000 }
  );
  const data = JSON.parse(raw);
  const entries = data.total_volumes.map((v: [number, number]) => ({
    date: new Date(v[0]).toISOString().slice(0, 10),
    volume: v[1],
  }));
  console.log(`  Got ${entries.length} data points`);
  return entries;
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  console.log('=== Circle Data Fetch ===\n');

  // Fetch all data
  const overview = await fetchStablecoinOverview();
  const usdcHistory = await fetchStablecoinHistory(USDC_ID);
  const usdtHistory = await fetchStablecoinHistory(USDT_ID);
  let totalMcapHistory = await fetchTotalMcapHistory();
  const treasuryRate = await fetchTreasuryRate();
  const usdcVolume = await fetchUsdcVolume();

  // Fallback for total mcap: sum USDC + USDT
  if (totalMcapHistory.length === 0) {
    console.log('Using USDC+USDT sum as total mcap fallback');
    const dateMap = new Map<string, number>();
    for (const p of usdcHistory) dateMap.set(p.date, (dateMap.get(p.date) || 0) + p.mcap);
    for (const p of usdtHistory) dateMap.set(p.date, (dateMap.get(p.date) || 0) + p.mcap);
    totalMcapHistory = Array.from(dateMap.entries())
      .map(([date, totalMcap]) => ({ date, totalMcap }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  console.log('\nWriting data files...');

  // 1. Total stablecoin market cap
  writeJson('stablecoin-total-mcap.json', totalMcapHistory);

  // 2. USDC vs USDT market cap
  const usdcMap = new Map(usdcHistory.map(p => [p.date, p.mcap]));
  const usdtMap = new Map(usdtHistory.map(p => [p.date, p.mcap]));
  const allDates = [...new Set([...usdcMap.keys(), ...usdtMap.keys()])].sort();
  const usdcUsdtMcap = allDates
    .filter(d => usdcMap.has(d) && usdtMap.has(d))
    .map(date => ({
      date,
      usdcMcap: usdcMap.get(date)!,
      usdtMcap: usdtMap.get(date)!,
    }));
  writeJson('usdc-usdt-mcap.json', usdcUsdtMcap);

  // 3. USDC & USDT market share
  const totalMap = new Map(totalMcapHistory.map(p => [p.date, p.totalMcap]));
  const marketShare = usdcHistory
    .filter(p => totalMap.has(p.date) && totalMap.get(p.date)! > 0 && usdtMap.has(p.date))
    .map(p => ({
      date: p.date,
      sharePercent: (p.mcap / totalMap.get(p.date)!) * 100,
      usdtSharePercent: ((usdtMap.get(p.date) || 0) / totalMap.get(p.date)!) * 100,
    }));
  writeJson('usdc-market-share.json', marketShare);

  // 4. Treasury rate
  writeJson('treasury-rate.json', treasuryRate);

  // 5. USDC volume
  writeJson('usdc-volume.json', usdcVolume);

  // 6. Estimated revenue = USDC mcap × rate × 50%
  if (treasuryRate.length > 0) {
    const rateMap = new Map(treasuryRate.map(p => [p.date, p.rate]));
    let lastRate = 0;
    const revenue = usdcHistory.map(p => {
      const r = rateMap.get(p.date);
      if (r !== undefined) lastRate = r;
      return { date: p.date, revenue: p.mcap * (lastRate / 100) * 0.5 };
    }).filter(p => p.revenue > 0);
    writeJson('estimated-revenue.json', revenue);
  } else {
    writeJson('estimated-revenue.json', []);
  }

  // 7. Current metrics snapshot
  const latestRate = treasuryRate.length > 0 ? treasuryRate[treasuryRate.length - 1].rate : null;
  const currentRevenue = latestRate !== null ? overview.usdcMcap * (latestRate / 100) * 0.5 : null;
  writeJson('current-metrics.json', {
    totalMcap: overview.totalMcap,
    usdcMcap: overview.usdcMcap,
    usdtMcap: overview.usdtMcap,
    sharePercent: overview.totalMcap > 0 ? (overview.usdcMcap / overview.totalMcap) * 100 : 0,
    rate: latestRate,
    revenue: currentRevenue,
    updatedAt: new Date().toISOString(),
  });

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Failed:', err.message || err);
  process.exit(1);
});
