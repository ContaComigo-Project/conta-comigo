import { BAND_META, FILTER_BANDS, type Band } from '../band';
import type { QuickFilter } from '../hooks/use-expenses-state';

interface QuickFilterBarProps {
  totalCats: number;
  counts: Record<Band, number>;
  filter: QuickFilter;
  setFilter: (f: QuickFilter) => void;
}

export function QuickFilterBar({ totalCats, counts, filter, setFilter }: QuickFilterBarProps) {
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
        {FILTER_BANDS.map((f) => {
          const m = BAND_META[f];
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
    </article>
  );
}