import { useState } from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';
import { formatBRL } from '../../../../utils/formatters';
import type { InvestmentAsset, AssetClass } from '../../../../data/investments';

interface InvestmentsTableProps {
  assets: InvestmentAsset[];
}

type FilterOption = 'todos' | AssetClass;

const FILTERS: { id: FilterOption; label: string }[] = [
  { id: 'todos', label: 'Todos os Ativos' },
  { id: 'renda-fixa', label: 'Renda Fixa' },
  { id: 'tesouro', label: 'Tesouro' },
  { id: 'fiis', label: 'FIIs' },
  { id: 'acoes', label: 'Ações' },
  { id: 'poupanca', label: 'Poupança' },
];

export default function InvestmentsTable({ assets }: InvestmentsTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todos');

  const filteredAssets = activeFilter === 'todos'
    ? assets
    : assets.filter((a) => a.category === activeFilter);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header & Filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#36b37e] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#001b42]">Carteira de Ativos</h2>
            <p className="text-xs text-slate-500">Posição consolidada dos seus investimentos integrados via Open Finance</p>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#36b37e] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
              <th className="py-3 px-3">Ativo</th>
              <th className="py-3 px-3">Instituição</th>
              <th className="py-3 px-3 text-right">Valor Aplicado</th>
              <th className="py-3 px-3 text-right">Saldo Atual</th>
              <th className="py-3 px-3 text-right">Rentabilidade</th>
              <th className="py-3 px-3 text-right">Part. %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3 px-3">
                  <div>
                    <span className="font-semibold text-slate-800 group-hover:text-[#36b37e] transition-colors">
                      {asset.name}
                    </span>
                    <p className="text-xs text-slate-400 font-mono">{asset.code} • {asset.benchmark}</p>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-600 text-xs">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {asset.institution}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">
                  R$ {formatBRL(asset.investedAmountInCents / 100)}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-[#001b42] font-mono">
                  R$ {formatBRL(asset.currentAmountInCents / 100)}
                </td>
                <td className="py-3 px-3 text-right font-medium text-emerald-600 font-mono">
                  <span className="inline-flex items-center gap-0.5 justify-end">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{asset.profitabilityPercent}%
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-slate-700 font-mono">
                  {asset.sharePercent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
