import { LayoutGrid, ListTree } from 'lucide-react';

export type ViewMode = 'single' | 'history';

interface SegmentedViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function SegmentedViewToggle({ viewMode, onChange }: SegmentedViewToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden p-0.5">
      <button
        type="button"
        onClick={() => onChange('single')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all cursor-pointer ${
          viewMode === 'single'
            ? 'bg-[#36b37e] text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <LayoutGrid size={14} strokeWidth={2} />
        Visão do mês
      </button>
      <button
        type="button"
        onClick={() => onChange('history')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all cursor-pointer ${
          viewMode === 'history'
            ? 'bg-[#36b37e] text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <ListTree size={14} strokeWidth={2} />
        Histórico (todos os meses)
      </button>
    </div>
  );
}
