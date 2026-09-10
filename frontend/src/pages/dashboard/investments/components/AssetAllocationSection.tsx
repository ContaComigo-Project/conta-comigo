import { PieChart } from 'lucide-react';
import { formatBRL } from '../../../../utils/formatters';
import type { AssetAllocation } from '../../../../data/investments';

interface AssetAllocationSectionProps {
  allocations: AssetAllocation[];
}

export default function AssetAllocationSection({ allocations }: AssetAllocationSectionProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#36b37e] flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#001b42]">Alocação por Classe de Ativos</h2>
            <p className="text-xs text-slate-500">Distribuição patrimonial entre renda fixa, renda variável e títulos públicos</p>
          </div>
        </div>
      </div>

      {/* Multi-segment visual bar */}
      <div className="space-y-2">
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5">
          {allocations.map((item) => (
            <div
              key={item.category}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.label}: ${item.percentage}%`}
              className="h-full rounded-full transition-all duration-500 hover:opacity-90"
            />
          ))}
        </div>
      </div>

      {/* Allocations breakdown grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allocations.map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">R$ {formatBRL(item.totalInCents / 100)}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#001b42]">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
