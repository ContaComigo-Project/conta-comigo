import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Loader2 } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-[#36b37e]" />
        <p className="text-sm font-medium">Carregando carteira de investimentos...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#36b37e]/10 text-[#36b37e] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001b42]">Investimentos</h1>
            <p className="text-sm text-slate-500">
              Consolidação de patrimônio, alocação e proventos via Open Finance
            </p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
      </div>

      {/* Metric Cards */}
      <InvestmentOverviewCards summary={data.summary} />

      {/* Asset Allocation */}
      <AssetAllocationSection allocations={data.allocations} />

      {/* Main Grid: Investments Table & Sidebar (Earnings + AI Diagnosis) */}
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
