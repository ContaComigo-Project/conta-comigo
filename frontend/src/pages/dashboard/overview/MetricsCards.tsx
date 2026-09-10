import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, BarChart3, TrendingUp, TrendingDown as TrendDown } from 'lucide-react';
import { ApiSource } from '../../../data/api-source';
import { useCountUp } from '../../../hooks/use-count-up';
import { formatBRL } from '../../../utils/formatters';

// Integração real (ApiSource): saldo total, gastos do mês e fatura do cartão
// vêm de GET /dashboard/summary (HN-003, RN-009). Sem login, degrada em zero.
const api = new ApiSource();

type Metrica = {
  id: string;
  label: string;
  value: number;
  icon: 'wallet' | 'trending-down' | 'bar-chart';
  highlight: boolean;
  trend: number;
  trendLabel: string;
};

const ICONS: Record<Metrica['icon'], React.ReactNode> = {
  wallet: <Wallet size={18} strokeWidth={1.7} />,
  'trending-down': <TrendingDown size={18} strokeWidth={1.7} />,
  'bar-chart': <BarChart3 size={18} strokeWidth={1.7} />,
};

function TrendBadge({ trend, label }: { trend: number; label: string }) {
  const isPositive = trend >= 0;
  return (
    <div className="flex items-center gap-1.5 mt-3">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${
          isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
        }`}
      >
        {isPositive ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendDown size={11} strokeWidth={2.5} />}
        {isPositive ? '+' : ''}{trend}%
      </span>
      <span className="text-[0.7rem] text-slate-400">{label}</span>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metrica }) {
  const animated = useCountUp(metric.value, 1400);

  return (
    <article
      id={`metric-card-${metric.id}`}
      className={`relative overflow-hidden rounded-2xl p-5 ${
        metric.highlight
          ? 'bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-md shadow-cc-green/20'
          : 'bg-white border border-slate-100 shadow-sm'
      }`}
    >
      {metric.highlight && (
        <>
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -right-2 w-32 h-32 rounded-full bg-white/5" />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className={`text-xs font-semibold uppercase tracking-wider ${metric.highlight ? 'text-white/70' : 'text-slate-400'}`}>
            {metric.label}
          </p>
          <span
            className={`w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ${
              metric.highlight ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {ICONS[metric.icon]}
          </span>
        </div>

        <p className={`text-2xl font-bold tracking-tight tabular-nums ${metric.highlight ? 'text-white' : 'text-slate-800'}`}>
          R$ {formatBRL(animated)}
        </p>

        {metric.highlight ? (
          <div className="flex items-center gap-1.5 mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${metric.trend >= 0 ? 'bg-white/20 text-white' : 'bg-red-200/40 text-red-100'}`}>
              {metric.trend >= 0 ? <TrendingUp size={10} strokeWidth={2.5} /> : <TrendDown size={10} strokeWidth={2.5} />}
              {metric.trend >= 0 ? '+' : ''}{metric.trend}%
            </span>
            <span className="text-[0.7rem] text-white/60">{metric.trendLabel}</span>
          </div>
        ) : (
          <TrendBadge trend={metric.trend} label={metric.trendLabel} />
        )}
      </div>
    </article>
  );
}

function metricasDoResumo(saldoCentavos: number, gastosCentavos: number, faturaCentavos: number): Metrica[] {
  return [
    { id: 'saldo', label: 'Saldo Total', value: saldoCentavos / 100, icon: 'wallet', highlight: true, trend: 0, trendLabel: 'contas ativas' },
    { id: 'gastos', label: 'Gastos do Mês', value: gastosCentavos / 100, icon: 'trending-down', highlight: false, trend: 0, trendLabel: 'mês de referência' },
    { id: 'fatura', label: 'Fatura do Cartão', value: faturaCentavos / 100, icon: 'bar-chart', highlight: false, trend: 0, trendLabel: 'separada do saldo' },
  ];
}

export default function MetricsCards() {
  const [metricas, setMetricas] = useState<Metrica[]>(metricasDoResumo(0, 0, 0));

  useEffect(() => {
    api.resumoConsolidado().then((r) => {
      if (r.estado === 'ok') {
        setMetricas(metricasDoResumo(r.dados.saldoTotalEmCentavos, r.dados.gastosDoMesEmCentavos, r.dados.faturaDoCartaoEmCentavos));
      }
    });
  }, []);

  return (
    <section aria-label="Métricas principais">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricas.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}