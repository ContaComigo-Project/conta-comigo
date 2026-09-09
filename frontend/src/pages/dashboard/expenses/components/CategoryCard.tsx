import { Check, Pencil, Trash2, TrendingDown, TrendingUp, X } from 'lucide-react';
import type { CategoryOfMonth } from '../hooks/use-expenses-state';
import type { Transaction } from '../../../../data/transaction';
import { formatBRL } from '../../../../utils/formatters';
import { BAND_META } from '../band';

interface CategoryCardProps {
  category: CategoryOfMonth;
  isEditing: boolean;
  draftLimit: number;
  animate: boolean;
  relatedTxs: Transaction[];
  onToggleEdit: () => void;
  onApply: () => void;
  onCancel: () => void;
  onNudge: (delta: number) => void;
  onSetDraft: (raw: string) => void;
  onRemoveLimit: () => void;
}

export function CategoryCard({
  category: c,
  isEditing,
  draftLimit,
  animate,
  relatedTxs,
  onToggleEdit,
  onApply,
  onCancel,
  onNudge,
  onSetDraft,
  onRemoveLimit,
}: CategoryCardProps) {
  const limit = c.limitInCents ?? 0;
  const draftPct = Math.min(200, ((c.spentInCents / Math.max(1, Math.round(draftLimit * 100))) * 100));
  const displayPct = isEditing ? draftPct : c.percentage;
  const barHeight = Math.min(100, displayPct);
  const overflowPct = displayPct > 100 ? Math.min(40, displayPct - 100) : 0;
  const meta = BAND_META[c.band];

  return (
    <article
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 p-4 ${
        isEditing
          ? `${meta.softBg} border-slate-200 shadow-[0_0_0_3px_rgba(54,179,126,0.08)]`
          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-[0_6px_20px_rgba(15,23,42,0.05)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${c.color}15` }}
          >
            <i className={`fas ${c.icon}`} style={{ color: c.color }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[0.82rem] font-bold text-slate-800 truncate">{c.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[0.58rem] font-bold uppercase border ${meta.badgeClass}`}
              >
                <meta.Icon size={8.5} strokeWidth={2.5} />
                {meta.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {c.limitInCents !== null && !isEditing && (
            <button
              type="button"
              onClick={onRemoveLimit}
              aria-label="Remover limite"
              title="Remover limite"
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 size={13} strokeWidth={2.1} />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleEdit}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isEditing
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
            aria-label={isEditing ? 'Cancelar edição' : 'Editar limite'}
          >
            {isEditing ? (
              <X size={13} strokeWidth={2.3} />
            ) : (
              <Pencil size={13} strokeWidth={2.1} />
            )}
          </button>
        </div>
      </div>

      <div className="relative h-36 mb-3 flex items-end justify-center">
        <div className="relative w-14 h-full">
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-24 h-px border-t border-dashed border-amber-300/80 pointer-events-none" />
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-24 h-px border-t border-dashed border-red-300/80 pointer-events-none" />
          <div className="absolute inset-0 border-l-2 border-r-2 border-dashed border-slate-300/70 pointer-events-none" />

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-full rounded-t-lg overflow-hidden bg-slate-50 border border-slate-100">
            {overflowPct > 0 && (
              <div
                className="absolute left-0 right-0 top-0 bg-red-500/30 border-b-2 border-red-500 transition-all duration-1200 ease-out"
                style={{
                  height: animate ? `${(overflowPct / 40) * 20}%` : '0%',
                }}
              />
            )}
            <div
              className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-1200 ease-out ${meta.barClass} shadow-[0_-2px_10px_rgba(0,0,0,0.08)]`}
              style={{ height: animate ? `${barHeight}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      <div className="text-center mb-3">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[0.7rem] font-semibold text-slate-400">R$</span>
          <span className="text-base font-bold text-slate-800 tabular-nums">
            {formatBRL(c.spentInCents)}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => onNudge(-50)}
                className="w-7 h-7 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
              >
                −
              </button>
              <input
                type="number"
                value={draftLimit}
                onChange={(e) => onSetDraft(e.target.value)}
                className="w-20 text-center text-[0.78rem] font-bold tabular-nums outline-none py-1 border-x border-slate-200"
              />
              <button
                type="button"
                onClick={() => onNudge(50)}
                className="w-7 h-7 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[0.7rem] text-slate-500 mt-0.5">
            limite{' '}
            <span className="font-bold text-slate-700 tabular-nums">
              {c.limitInCents === null ? 'sem limite' : `R$ ${formatBRL(limit)}`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <span className={`text-[0.72rem] font-bold tabular-nums ${meta.textClass}`}>
            {displayPct.toFixed(0)}%
          </span>
          {c.trend !== null && (
            <span
              className={`inline-flex items-center gap-0.5 text-[0.68rem] font-semibold ${
                c.trend >= 0 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {c.trend >= 0 ? (
                <TrendingUp size={10} strokeWidth={2.4} />
              ) : (
                <TrendingDown size={10} strokeWidth={2.4} />
              )}
              {c.trend >= 0 ? '+' : ''}
              {c.trend}%
            </span>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-1.5 mt-1">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-linear-to-br from-cc-dark-green to-cc-green text-white text-[0.7rem] font-semibold hover:shadow-sm transition-all cursor-pointer"
          >
            <Check size={12} strokeWidth={2.4} />
            Aplicar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[0.7rem] font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={12} strokeWidth={2.4} />
            Cancelar
          </button>
        </div>
      )}

      {relatedTxs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-slate-400">
            Transações ({relatedTxs.length})
          </p>
          {relatedTxs.slice(0, 2).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between gap-2">
              <span className="text-[0.7rem] text-slate-600 truncate">{tx.description}</span>
              <span className="text-[0.7rem] font-semibold text-slate-700 tabular-nums">
                {tx.formattedAmount}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}