import { Calendar, DollarSign } from 'lucide-react';
import { formatBRL } from '../../../../utils/formatters';
import type { EarningsRecord } from '../../../../data/investments';

interface EarningsHistoryCardProps {
  earnings: EarningsRecord[];
}

export default function EarningsHistoryCard({ earnings }: EarningsHistoryCardProps) {
  return (
    <div className="bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Proventos e Rendimentos</h2>
            <p className="text-xs text-slate-500">Histórico de rendimentos, dividendos e JCP creditados</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {earnings.map((e) => (
          <div key={e.id} className="py-3 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{e.assetName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-medium">
                    {e.type}
                  </span>
                  <span>{new Date(e.paidAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <span className="font-semibold text-emerald-600 font-mono">
              +R$ {formatBRL(e.amountInCents / 100)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
