import { ArrowUpRight, TrendingUp, TrendingDown, XCircle } from 'lucide-react';
import type { MonthSummary } from '../hooks/use-expenses-state';
import { formatBRL } from '../../../../utils/formatters';
import { BAND_META, FILTER_BANDS } from '../band';

export interface RecurrentProblem {
  category: string;
  vezesEmVermelho: number;
  excessoTotalEmCentavos: number;
}

interface HistoricalOverviewProps {
  summaries: MonthSummary[];
  problems: RecurrentProblem[];
  onSelectMonth: (month: string) => void;
  animate: boolean;
}

export function HistoricalOverview({ summaries, problems, onSelectMonth, animate }: HistoricalOverviewProps) {
  const maxSpent = Math.max(...summaries.map((s) => s.totalSpent));

  const avgSpent = +(summaries.reduce((s, m) => s + m.totalSpent, 0) / summaries.length).toFixed(2);
  const avgLimit = summaries.reduce((s, m) => s + m.totalLimit, 0) / summaries.length;
  const avgPct = (avgSpent / avgLimit) * 100;

  const trendPct = (() => {
    if (summaries.length < 2) return 0;
    const first = summaries[0].totalSpent;
    const last = summaries[summaries.length - 1].totalSpent;
    if (first === 0) return 0;
    return +(((last - first) / first) * 100).toFixed(1);
  })();

  const totalCategoryMonths = summaries.reduce((acc, s) => acc + (s.counts.green + s.counts.amber + s.counts.red), 0);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-2xl p-5 bg-linear-to-br from-cc-dark-blue to-cc-dark-green text-white shadow-md shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/70 mb-1.5">
              Gasto médio dos meses
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-white/80">R$</span>
              <span className="text-3xl font-bold tabular-nums tracking-tight">{formatBRL(avgSpent)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-white/15 ${
                  trendPct >= 0 ? 'text-amber-200' : 'text-emerald-200'
                }`}
              >
                {trendPct >= 0 ? (
                  <TrendingUp size={10} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={10} strokeWidth={2.5} />
                )}
                {trendPct >= 0 ? '+' : ''}
                {trendPct}% na série
              </span>
              <span className="text-[0.65rem] text-white/70">
                média {avgPct.toFixed(0)}% dos limites
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Status semáforo (total de categorias-mês)
          </p>
          <div className="space-y-2.5">
            {FILTER_BANDS.map((s) => {
              const m = BAND_META[s];
              const total = summaries.reduce((acc, sum) => acc + sum.counts[s], 0);
              const pct = totalCategoryMonths > 0 ? (total / totalCategoryMonths) * 100 : 0;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-[0.7rem] mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <span className={`w-2 h-2 rounded-full ${m.dotClass}`} />
                      {m.label}
                    </div>
                    <span className="font-bold tabular-nums text-slate-800">
                      {total} <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${m.barClass} transition-all duration-1000 rounded-full`}
                      style={{ width: animate ? `${pct}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Top problemas recorrentes
          </p>
          <div className="space-y-2">
            {problems.map((issue, idx) => (
              <button
                key={`${issue.category}-${idx}`}
                type="button"
                onClick={() => onSelectMonth(summaries.find((s) => s.status === 'red')?.month ?? summaries[0]?.month)}
                className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-50/60 border border-red-100 hover:bg-red-50 hover:shadow-sm transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                    <XCircle size={13} strokeWidth={2.4} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[0.75rem] font-bold text-slate-800 truncate">
                      {issue.category}
                    </p>
                    <p className="text-[0.65rem] text-slate-500">
                      {issue.vezesEmVermelho}x estourou · R$ {formatBRL(issue.excessoTotalEmCentavos)} no total
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  size={13}
                  strokeWidth={2.2}
                  className="text-slate-400 group-hover:text-cc-dark-green transition-colors shrink-0"
                />
              </button>
            ))}
            {problems.length === 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[0.75rem] text-emerald-700 font-medium">
                Nenhum mês estourou orçamento. Parabéns!
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Evolução mensal de gastos</h2>
            <p className="text-[0.72rem] text-slate-400 mt-0.5">
              Cada barra representa o total gasto do mês vs. o limite mensal consolidado.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[0.65rem] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-linear-to-t from-cc-dark-green to-cc-green" />
              Gasto
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border-2 border-dashed border-slate-400" />
              Limite
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-end pb-2">
          {summaries.map((s) => {
            const meta = BAND_META[s.status];
            const pctHeight = maxSpent > 0 ? (s.totalSpent / maxSpent) * 100 : 0;
            const limitHeight = maxSpent > 0 ? (s.totalLimit / maxSpent) * 100 : 0;
            return (
              <button
                key={s.month}
                type="button"
                onClick={() => onSelectMonth(s.month)}
                className="group flex flex-col items-center gap-3 focus:outline-none cursor-pointer"
              >
                <div className="relative w-full h-48 flex items-end justify-center">
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-12 border-t-2 border-dashed border-slate-300"
                    style={{ bottom: `${limitHeight}%` }}
                    title={`Limite R$ ${formatBRL(s.totalLimit)}`}
                  />

                  <div className="relative w-10 h-full flex items-end">
                    <div className="absolute inset-0 rounded-t-lg bg-slate-50 border border-slate-100" />
                    <div
                      className={`relative w-full rounded-t-lg ${meta.barClass} shadow-[0_-2px_12px_rgba(0,0,0,0.08)] transition-all duration-1000 ease-out group-hover:brightness-105`}
                      style={{ height: animate ? `${pctHeight}%` : '0%' }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[0.62rem] font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
                        R$ {formatBRL(s.totalSpent)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                    <span className="text-[0.72rem] font-bold text-slate-800 tabular-nums">
                      {s.percentage.toFixed(0)}%
                    </span>
                    {s.current && (
                      <span className="text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-px rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        atual
                      </span>
                    )}
                  </div>
                  <span className="text-[0.8rem] font-bold text-slate-700">{s.label}</span>
                  <span className="text-[0.65rem] text-slate-400 tabular-nums">
                    R$ {formatBRL(s.totalSpent)}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {s.counts.red > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-red-600 text-[0.55rem] font-semibold">
                        <XCircle size={8} strokeWidth={2.5} /> {s.counts.red}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {summaries
          .slice()
          .reverse()
          .map((s) => {
            const meta = BAND_META[s.status];
            return (
              <button
                key={s.month}
                type="button"
                onClick={() => onSelectMonth(s.month)}
                className="text-left rounded-2xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-[0_6px_20px_rgba(15,23,42,0.05)] transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-slate-800">{s.fullLabel}</h3>
                      {s.current && (
                        <span className="text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-px rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          atual
                        </span>
                      )}
                    </div>
                    <p className="text-[0.7rem] text-slate-500">
                      R$ {formatBRL(s.totalSpent)} de R$ {formatBRL(s.totalLimit)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase border ${meta.badgeClass}`}>
                    <meta.Icon size={10} strokeWidth={2.5} />
                    {meta.label}
                  </span>
                </div>

                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${meta.barClass} transition-all duration-1000`}
                    style={{ width: animate ? `${Math.min(100, s.percentage)}%` : '0%' }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {FILTER_BANDS.map((st) => {
                    const m = BAND_META[st];
                    return (
                      <div
                        key={st}
                        className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg border border-slate-100 bg-slate-50"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${m.dotClass}`} />
                        <span className="text-[0.7rem] font-bold tabular-nums text-slate-700">
                          {s.counts[st]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <p className="text-[0.7rem] text-slate-500 leading-tight">
                    {s.counts.red > 0 ? `${s.counts.red} categoria(s) estouraram o limite` : 'Nenhuma categoria estourou'}
                  </p>
                  <p className={`text-[0.75rem] font-bold tabular-nums ${meta.textClass}`}>
                    {s.percentage.toFixed(0)}% dos limites
                  </p>
                </div>
              </button>
            );
          })}
      </section>
    </div>
  );
}