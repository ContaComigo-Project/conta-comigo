import { Plus } from 'lucide-react';
import { mockConnectedBanks, type ConnectedBank } from '../../../data/dashboard.mock';

function StatusIndicator({ status }: { status: ConnectedBank['status'] }) {
  if (status === 'active') {
    return <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />;
  }
  if (status === 'syncing') {
    return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_0_3px_rgba(251,191,36,0.2)]" />;
  }
  return <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.2)]" />;
}

export default function ConnectedBanksWidget() {
  const total = mockConnectedBanks.reduce((acc, b) => acc + b.balance, 0);

  return (
    <section aria-label="Bancos conectados" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Bancos Conectados</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">{mockConnectedBanks.length} instituições · Open Finance</p>
        </div>
        <button
          id="banks-widget-add"
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-dashed border-[#36b37e] text-[#36b37e] hover:bg-emerald-50 transition-colors"
          aria-label="Conectar novo banco"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>

      <ul className="flex flex-col gap-3 mb-4">
        {mockConnectedBanks.map((bank) => (
          <li key={bank.id} className="flex items-center gap-3 group hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-xl transition-colors cursor-default">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
              style={{ backgroundColor: bank.color }}
            >
              {bank.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-slate-800 truncate">{bank.name}</p>
                <StatusIndicator status={bank.status} />
              </div>
              <p className="text-[0.65rem] text-slate-400">{bank.lastSync}</p>
            </div>

            <p className="text-sm font-bold text-slate-800 tabular-nums shrink-0">
              {bank.formattedBalance}
            </p>
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Total consolidado</span>
        <span className="text-sm font-bold text-[#0a6d42]">
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </section>
  );
}
