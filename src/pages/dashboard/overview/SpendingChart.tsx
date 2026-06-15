import { useEffect, useState } from 'react';
import { Music2 } from 'lucide-react';
import { mockSpendingCategories } from '../../../data/dashboard.mock';

function ChartBar({
  category,
  maxValue,
  animate,
}: {
  category: typeof mockSpendingCategories[0];
  maxValue: number;
  animate: boolean;
}) {
  const heightPercent = (category.value / maxValue) * 100;

  return (
    <div className="flex flex-col items-center gap-2 flex-1 group">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[0.65rem] font-bold text-slate-600 text-center whitespace-nowrap">
        R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>

      <div className="relative w-full h-32 flex items-end justify-center">
        <div
          className="w-full rounded-t-lg transition-all duration-700 ease-out"
          style={{
            height: animate ? `${heightPercent}%` : '0%',
            backgroundColor: category.color,
            minHeight: animate ? '8px' : '0px',
            boxShadow: animate ? `0 -2px 8px ${category.color}40` : 'none',
          }}
        />
      </div>

      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <i className={`fas ${category.icon}`} style={{ color: category.color }} />
      </div>

      <span className="text-[0.62rem] font-medium text-slate-400 text-center leading-tight max-w-[48px]">
        {category.name.length > 8 ? category.name.slice(0, 7) + '.' : category.name}
      </span>
    </div>
  );
}

function CategoryLegend() {
  const total = mockSpendingCategories.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
      {mockSpendingCategories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
          <span className="text-xs text-slate-500 flex-1 truncate">{cat.name}</span>
          <span className="text-xs font-semibold text-slate-700">{cat.percentage.toFixed(0)}%</span>
        </div>
      ))}
      <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between">
        <span className="text-xs text-slate-400 font-medium">Total no mês</span>
        <span className="text-xs font-bold text-slate-800">
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

export default function SpendingChart() {
  const maxValue = Math.max(...mockSpendingCategories.map((c) => c.value));
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section aria-label="Mapa de gastos por categoria" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Mapa de Gastos</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Junho 2026 · Categorizado pela IA</p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
          <Music2 size={13} strokeWidth={2} color="#36b37e" />
          <span className="text-[0.68rem] font-semibold text-slate-500">IA Semântica</span>
        </div>
      </div>

      <div className="flex items-end gap-1.5 px-1">
        {mockSpendingCategories.map((category) => (
          <ChartBar key={category.id} category={category} maxValue={maxValue} animate={animate} />
        ))}
      </div>

      <CategoryLegend />
    </section>
  );
}
