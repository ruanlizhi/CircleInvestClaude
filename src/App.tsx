import MetricCards from './components/MetricCards';
import StablecoinMarketCap from './components/charts/StablecoinMarketCap';
import UsdcVsUsdt from './components/charts/UsdcVsUsdt';
import UsdcMarketShare from './components/charts/UsdcMarketShare';
import TreasuryRate from './components/charts/TreasuryRate';
import UsdcVolume from './components/charts/UsdcVolume';
import EstimatedRevenue from './components/charts/EstimatedRevenue';
import { useChartData } from './hooks/useChartData';
import type { CurrentMetrics } from './types';

function Header() {
  const { data } = useChartData<CurrentMetrics>('current-metrics.json');
  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : '...';

  return (
    <header className="text-center mb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
        Circle Observatory
      </h1>
      <p className="text-gray-500 text-sm">
        Stablecoin data dashboard for Circle investment research
        <span className="mx-2">|</span>
        Updated: {updatedAt}
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-8 py-6 border-t border-[#2a2b35] text-center text-gray-600 text-xs">
      <p>
        Data sources: <a href="https://defillama.com" className="text-gray-400 hover:text-gray-200" target="_blank" rel="noreferrer">DefiLlama</a>
        {' | '}
        <a href="https://www.coingecko.com" className="text-gray-400 hover:text-gray-200" target="_blank" rel="noreferrer">CoinGecko</a>
        {' | '}
        <a href="https://fred.stlouisfed.org" className="text-gray-400 hover:text-gray-200" target="_blank" rel="noreferrer">FRED</a>
      </p>
      <p className="mt-1">Revenue estimate = USDC Market Cap x Treasury Rate x 50% (net of Coinbase revenue share)</p>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-200 px-4 py-8 max-w-7xl mx-auto">
      <Header />
      <MetricCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StablecoinMarketCap />
        <UsdcVsUsdt />
        <UsdcMarketShare />
        <TreasuryRate />
        <UsdcVolume />
        <EstimatedRevenue />
      </div>
      <Footer />
    </div>
  );
}
