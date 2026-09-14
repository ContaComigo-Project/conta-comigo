import { useEffect, useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import { getInvestmentsData, type InvestmentsData } from '../../../data/investments';
import InvestmentOverviewCards from './components/InvestmentOverviewCards';
import AssetAllocationSection from './components/AssetAllocationSection';
import InvestmentsTable from './components/InvestmentsTable';
import EarningsHistoryCard from './components/EarningsHistoryCard';
import AIDiversificationCard from './components/AIDiversificationCard';

export default function InvestmentsPage() {
  const [data, setData] = useState<InvestmentsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function carregar() {
      try {
        const res = await getInvestmentsData();
        if (active) setData(res);
      } finally {
        if (active) setLoading(false);
      }
    }

    carregar();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cc-green" />
        <p className="text-sm font-medium">Carregando carteira de investimentos...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            <TrendingUp size={12} strokeWidth={2} />
            Patrimônio
          </div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Investimentos</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Consolidação de patrimônio, alocação e proventos via Open Finance.
          </p>
        </div>
      </header>

      <InvestmentOverviewCards summary={data.summary} />

      <AssetAllocationSection allocations={data.allocations} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvestmentsTable assets={data.assets} />
        </div>

        <div className="space-y-6">
          <AIDiversificationCard />
          <EarningsHistoryCard earnings={data.earnings} />
        </div>
      </div>
    </div>
  );
}