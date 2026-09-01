import { ChevronDown, ChevronUp } from 'lucide-react';
import { BUDGET_STATUS_META, type BudgetStatus, type MonthSummary } from '../../../../mocks';
import type { QuickFilter } from '../hooks/use-expenses-state';

interface QuickFilterBarProps {
  totalCats: number;
  counts: MonthSummary['counts'];
  filter: QuickFilter;
  setFilter: (f: QuickFilter) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
}

export function QuickFilterBar({
  totalCats,
  counts,
  filter,
  setFilter,
  showSuggestions,
  setShowSuggestions,
}: QuickFilterBarProps) {
  return (
    <article className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
      <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
        Filtros rápidos
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter('todas')}
          className={`text-[0.72rem] font-semibold px-2.5 py-1.5 rounded-lg transition-all border cursor-pointer ${
            filter === 'todas'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todas ({totalCats})
        </button>
        {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((f) => {
          const m = BUDGET_STATUS_META[f];
          const active = filter === f;
          const count = counts[f];
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[0.72rem] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border cursor-pointer ${
                active ? `${m.badgeClass} ring-2 ${m.ringClass}` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <m.Icon size={12} strokeWidth={2.3} />
              {m.label} ({count})
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-slate-600 cursor-pointer"
        >
          {showSuggestions ? (
            <ChevronUp size={12} strokeWidth={2.2} />
          ) : (
            <ChevronDown size={12} strokeWidth={2.2} />
          )}
          Mostrar sugestões da IA
        </button>
      </div>
    </article>
  );
}
