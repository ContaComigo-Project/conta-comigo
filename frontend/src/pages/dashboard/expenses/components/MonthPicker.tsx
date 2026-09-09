import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MonthSummary } from '../hooks/use-expenses-state';
import { BAND_META } from '../band';

interface MonthPickerProps {
  months: string[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  summaries: MonthSummary[];
  goPrev: () => void;
  goNext: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}

export function MonthPicker({
  months,
  selectedMonth,
  setSelectedMonth,
  summaries,
  goPrev,
  goNext,
  isAtStart,
  isAtEnd,
}: MonthPickerProps) {
  return (
    <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl p-4 bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center justify-center sm:justify-start gap-3 flex-1">
        <button
          type="button"
          onClick={goPrev}
          disabled={isAtStart}
          className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={17} strokeWidth={2.2} />
        </button>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {months.map((month) => {
            const s = summaries.find((sum) => sum.month === month);
            const meta = s ? BAND_META[s.status] : BAND_META['no-limit'];
            const isSelected = month === selectedMonth;
            const [ano, mes] = month.split('-');
            const label = `${ano} ${mes}`;
            return (
              <button
                key={month}
                type="button"
                onClick={() => setSelectedMonth(month)}
                className={`group flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-linear-to-br from-cc-dark-green to-cc-green text-white border-transparent shadow-md shadow-cc-green/20'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[0.7rem] font-bold ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                    {ano}
                  </span>
                  {s?.current && (
                    <span
                      className={`text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-px rounded-full ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      atual
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold leading-none">{label}</span>
                <div className={`flex items-center gap-1.5 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : meta.dotClass}`} />
                  <span className="text-[0.65rem] font-semibold tabular-nums">
                    {s ? `${s.percentage.toFixed(0)}%` : '—'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={isAtEnd}
          className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Próximo mês"
        >
          <ChevronRight size={17} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}