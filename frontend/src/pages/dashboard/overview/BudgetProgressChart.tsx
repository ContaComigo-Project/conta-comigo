import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { mockBudgetCategories, type BudgetCategory, type BudgetStatus } from '../../../mocks';

const STATUS_META: Record<BudgetStatus, {
  label: string;
  Icon: typeof CheckCircle2;
  badgeClass: string;
  dotClass: string;
  progressTrackClass: string;
  progressFillClass: string;
}> = {
  verde: {
    label: 'Verde',
    Icon: CheckCircle2,
    badgeClass: 'bg-emerald-100 text-emerald-700',
    dotClass: 'bg-emerald-500',
    progressTrackClass: 'from-emerald-50 via-emerald-50 to-slate-50',
    progressFillClass: 'from-emerald-500 to-emerald-600',
  },
  amarelo: {
    label: 'Atenção',
    Icon: AlertTriangle,
    badgeClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-500',
    progressTrackClass: 'from-amber-50 via-amber-50 to-slate-50',
    progressFillClass: 'from-amber-400 to-amber-500',
  },
  vermelho: {
    label: 'Excedido',
    Icon: XCircle,
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-500',
    progressTrackClass: 'from-red-50 via-red-50 to-slate-50',
    progressFillClass: 'from-red-500 to-red-600',
  },
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: BudgetStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide ${meta.badgeClass}`}>
      <meta.Icon size={10} strokeWidth={2.4} />
      {meta.label}
    </span>
  );
}

function MiniHistoryChart({ history, spent }: { history: BudgetCategory['history']; spent: number }) {
  const values = [...history.map((h) => h.spent), spent];
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-1 h-8 w-24 shrink-0">
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const isCurrent = i === values.length - 1;
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-sm transition-all duration-500 ${isCurrent ? 'bg-[#36b37e]' : 'bg-slate-200'}`}
            style={{ height: `${h}%`, minHeight: '3px' }}
            title={`${isCurrent ? 'Jun atual' : history[i]?.month ?? ''}: R$ ${formatBRL(v)}`}
          />
        );
      })}
    </div>
  );
}

function BudgetRow({ category, animate }: { category: BudgetCategory; animate: boolean }) {
  const meta = STATUS_META[category.status];
  const fillWidth = Math.min(100, category.percentage);

  return (
    <div className="group flex flex-col gap-2.5 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <i className={`fas ${category.icon}`} style={{ color: category.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-bold text-slate-800 truncate">{category.name}</h4>
              <StatusBadge status={category.status} />
            </div>
            <div className="flex items-center gap-2 text-[0.7rem] text-slate-500">
              <span className="font-medium tabular-nums">
                Limite: R$ {formatBRL(category.limit)}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                {category.suggestedLimit !== category.limit ? (
                  <span className="flex items-center gap-1 text-cc-dark-green">
                    <Sparkles size={10} strokeWidth={2.2} />
                    IA sugere R$ {formatBRL(category.suggestedLimit)}
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-slate-400">R$</span>
            <span className="text-lg font-bold tabular-nums text-slate-800 leading-none">
              {formatBRL(category.spent)}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-[0.65rem] font-semibold ${category.trend >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {category.trend >= 0 ? <TrendingUp size={10} strokeWidth={2.4} /> : <TrendingDown size={10} strokeWidth={2.4} />}
            {category.trend >= 0 ? '+' : ''}{category.trend}% vs. Mai
          </div>
        </div>
      </div>

      <div>
        <div className={`relative h-3 rounded-full overflow-hidden bg-linear-to-r ${meta.progressTrackClass}`}>
          <div className="absolute inset-y-0 left-[70%] w-px bg-amber-300/60 z-10" />
          <div className="absolute inset-y-0 left-[90%] w-px bg-red-400/70 z-10" />
          <div
            className={`h-full rounded-full bg-linear-to-r ${meta.progressFillClass} shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset] transition-all duration-1200 ease-out`}
            style={{ width: animate ? `${fillWidth}%` : '0%' }}
          />
          {category.percentage > 100 && (
            <div
              className="absolute top-0 h-full rounded-r-none bg-red-500/30 transition-all duration-1200 ease-out"
              style={{ left: '100%', width: animate ? `${Math.min(60, category.percentage - 100)}%` : '0%' }}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-[0.65rem] text-slate-500">
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.verde.dotClass}`} />
            <span>0–70%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.amarelo.dotClass}`} />
            <span>70–90%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.vermelho.dotClass}`} />
            <span>{'>'}90%</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <MiniHistoryChart history={category.history} spent={category.spent} />
            <div className="text-right">
              <div className="font-bold text-slate-700 tabular-nums">{category.percentage.toFixed(0)}%</div>
              <div className="text-[0.6rem] text-slate-400">
                {category.remaining > 0 ? `R$ ${formatBRL(category.remaining)} livres` : 'Sem margem'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStrip() {
  const totalSpent = mockBudgetCategories.reduce((s, c) => s + c.spent, 0);
  const totalLimit = mockBudgetCategories.reduce((s, c) => s + c.limit, 0);
  const totalPct = (totalSpent / totalLimit) * 100;
  const counts = mockBudgetCategories.reduce(
    (acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }),
    { verde: 0, amarelo: 0, vermelho: 0 }
  );

  return (
    <div className="flex items-stretch gap-3 mb-5 p-4 rounded-2xl bg-linear-to-br from-slate-50 to-white border border-slate-100">
      <div className="flex flex-col justify-center pr-4 border-r border-slate-100">
        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400 mb-1">Orçamento de Junho</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[0.8rem] font-semibold text-slate-400">R$</span>
          <span className="text-xl font-bold text-slate-800 tabular-nums">{formatBRL(totalSpent)}</span>
          <span className="text-xs text-slate-400 tabular-nums">/ R$ {formatBRL(totalLimit)}</span>
        </div>
        <div className="mt-2 h-1.5 w-48 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              totalPct <= 70 ? 'bg-emerald-500' : totalPct <= 90 ? 'bg-amber-400' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, totalPct)}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-around">
        {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((s) => {
          const meta = STATUS_META[s];
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.badgeClass}`}>
                <meta.Icon size={16} strokeWidth={2} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 leading-none">{counts[s]}</div>
                <div className="text-[0.65rem] text-slate-500 mt-0.5">{meta.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BudgetProgressChart() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 120);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...mockBudgetCategories].sort((a, b) => {
    const order: Record<BudgetStatus, number> = { vermelho: 0, amarelo: 1, verde: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return b.percentage - a.percentage;
  });

  return (
    <section aria-label="Orçamento por categoria com limites" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Orçamento Mensal</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Junho 2026 · Gastos vs. Limites por categoria</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
          <Sparkles size={13} strokeWidth={2} color="#36b37e" />
          <span className="text-[0.68rem] font-semibold text-slate-500">Limites semânticos</span>
        </div>
      </div>

      <SummaryStrip />

      <div className="flex flex-col gap-3">
        {sorted.map((c) => (
          <BudgetRow key={c.id} category={c} animate={animate} />
        ))}
      </div>
    </section>
  );
}
