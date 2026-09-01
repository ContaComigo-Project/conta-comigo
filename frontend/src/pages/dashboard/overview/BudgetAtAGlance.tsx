import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Sparkles, ArrowUpRight } from 'lucide-react';
import { mockBudgetCategories, type BudgetStatus } from '../../../mocks';
import { Link } from 'react-router-dom';

const STATUS_META: Record<BudgetStatus, {
  label: string;
  Icon: typeof CheckCircle2;
  barClass: string;
  badgeClass: string;
}> = {
  verde: {
    label: 'Dentro',
    Icon: CheckCircle2,
    barClass: 'bg-emerald-500',
    badgeClass: 'text-emerald-600 bg-emerald-50',
  },
  amarelo: {
    label: 'Atenção',
    Icon: AlertTriangle,
    barClass: 'bg-amber-400',
    badgeClass: 'text-amber-700 bg-amber-50',
  },
  vermelho: {
    label: 'Estourado',
    Icon: XCircle,
    barClass: 'bg-red-500',
    badgeClass: 'text-red-700 bg-red-50',
  },
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BudgetAtAGlance() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 140);
    return () => clearTimeout(t);
  }, []);

  const totalSpent = mockBudgetCategories.reduce((s, c) => s + c.spent, 0);
  const totalLimit = mockBudgetCategories.reduce((s, c) => s + c.limit, 0);
  const pct = (totalSpent / totalLimit) * 100;
  const overallStatus: BudgetStatus = pct <= 70 ? 'verde' : pct <= 90 ? 'amarelo' : 'vermelho';

  const counts = mockBudgetCategories.reduce(
    (acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }),
    { verde: 0, amarelo: 0, vermelho: 0 }
  );

  const alerts = mockBudgetCategories
    .filter((c) => c.status !== 'verde')
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2);

  return (
    <section aria-label="Orçamento em resumo" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Orçamento · Junho</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Acompanhe o quanto do seu limite foi utilizado</p>
        </div>
        <Link
          to="/dashboard/expenses"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cc-green/10 text-cc-dark-green hover:bg-cc-green/20 transition-colors text-[0.7rem] font-semibold"
        >
          Ajustar limites
          <ArrowUpRight size={12} strokeWidth={2.2} />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4 p-3 rounded-xl bg-linear-to-br from-slate-50 to-white border border-slate-100">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${STATUS_META[overallStatus].badgeClass}`}>
              <Sparkles size={9} strokeWidth={2.5} />
              {STATUS_META[overallStatus].label}
            </span>
            <span className="text-[0.65rem] text-slate-400">Total consolidado</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-slate-400">R$</span>
            <span className="text-xl font-bold text-slate-800 tabular-nums">{formatBRL(totalSpent)}</span>
            <span className="text-xs text-slate-400 tabular-nums">de R$ {formatBRL(totalLimit)}</span>
            <span className="ml-1 text-[0.7rem] font-semibold text-slate-500 tabular-nums">({pct.toFixed(0)}%)</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 shrink-0">
          {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((s) => {
            const m = STATUS_META[s];
            return (
              <div key={s} className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-white border border-slate-100">
                <m.Icon size={12} strokeWidth={2.4} className={m.badgeClass.split(' ')[0]} />
                <span className="text-[0.75rem] font-bold text-slate-800 leading-none mt-0.5 tabular-nums">{counts[s]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 mb-4">
        {mockBudgetCategories.map((c) => {
          const fillPct = Math.min(100, c.percentage);
          return (
            <div key={c.id} className="flex flex-col items-center gap-1.5">
              <div className="relative w-full h-24 rounded-lg bg-slate-50 overflow-hidden flex items-end border border-slate-100">
                <div className="absolute left-0 right-0 top-[30%] h-px border-t border-dashed border-amber-200 z-1" />
                <div className="absolute left-0 right-0 top-[10%] h-px border-t border-dashed border-red-200 z-1" />
                <div
                  className={`w-full ${STATUS_META[c.status].barClass} transition-all duration-1200 ease-out rounded-t-sm`}
                  style={{ height: animate ? `${fillPct}%` : '0%' }}
                />
                {c.percentage > 100 && (
                  <div
                    className="absolute top-0 left-0 right-0 bg-red-500/35 border-b-2 border-red-500 transition-all duration-1200 ease-out"
                    style={{ height: animate ? `${Math.min(35, c.percentage - 100)}%` : '0%' }}
                  />
                )}
              </div>
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}15` }}
              >
                <i className={`fas ${c.icon} text-[0.65rem]`} style={{ color: c.color }} />
              </div>
              <div className="text-[0.6rem] font-semibold text-slate-500 leading-tight text-center max-w-14 truncate w-full">
                {c.name}
              </div>
              <div className={`text-[0.6rem] font-bold tabular-nums leading-none ${STATUS_META[c.status].badgeClass.split(' ')[0]}`}>
                {c.percentage.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">Categorias de atenção</p>
          {alerts.map((a) => {
            const m = STATUS_META[a.status];
            return (
              <div key={a.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-7 h-7 rounded-md flex items-center justify-center ${m.badgeClass}`}>
                    <m.Icon size={13} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.75rem] font-bold text-slate-800 leading-tight">{a.name}</p>
                    <p className="text-[0.65rem] text-slate-500 leading-tight tabular-nums">
                      R$ {formatBRL(a.spent)} de R$ {formatBRL(a.limit)}
                    </p>
                  </div>
                </div>
                <span className={`text-[0.7rem] font-bold tabular-nums px-2 py-0.5 rounded-full ${m.badgeClass}`}>
                  {a.percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
