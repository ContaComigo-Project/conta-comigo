import { TrendingUp, DollarSign, Award, ArrowUpRight, BarChart3 } from 'lucide-react';
import { formatBRL } from '../../../../utils/formatters';
import { useCountUp } from '../../../../hooks/use-count-up';
import type { PortfolioSummary } from '../../../../data/investments';

interface InvestmentOverviewCardsProps {
  summary: PortfolioSummary;
}

// Mesmo padrão das métricas do painel (MetricsCards): os números começam em 0
// e sobem até o valor (useCountUp). As porcentagens usam 1 casa decimal.
export default function InvestmentOverviewCards({ summary }: InvestmentOverviewCardsProps) {
  const totalInvestido = useCountUp(summary.totalInvestedInCents / 100, 1400);
  const proventos = useCountUp(summary.monthlyEarningsInCents / 100, 1400);
  const desempenho = useCountUp(summary.totalProfitabilityPercent, 1400, 1);
  const benchmark = useCountUp(summary.portfolioVsBenchmarkPercent, 1400, 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Investido */}
      <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Investido
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-cc-green flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold text-slate-800 tabular-nums">
            R$ {formatBRL(totalInvestido)}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{summary.totalProfitabilityPercent}% rentabilidade histórica</span>
          </div>
        </div>
      </div>

      {/* Proventos do Mês */}
      <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Proventos do Mês
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold text-slate-800 tabular-nums">
            R$ {formatBRL(proventos)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dividendos, JCP e rendimentos recebidos
          </p>
        </div>
      </div>

      {/* Rentabilidade Acumulada */}
      <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Desempenho Geral
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold text-purple-700 tabular-nums">
            +{desempenho.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Retorno ponderado da carteira
          </p>
        </div>
      </div>

      {/* Benchmark */}
      <div className="bg-white border border-slate-100/80 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Benchmark (CDI)
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xl font-bold text-slate-800 tabular-nums">
            +{benchmark.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Acima do CDI ({summary.benchmarkRate})
          </p>
        </div>
      </div>
    </div>
  );
}