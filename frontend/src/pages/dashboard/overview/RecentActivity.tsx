import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { mockTransactions, type Transaction } from '../../../mocks';

function BankBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[0.6rem] font-bold"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {name}
    </span>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === 'credit';

  return (
    <li className="flex items-center gap-4 py-3 group hover:bg-slate-50 -mx-3 px-3 rounded-xl transition-colors duration-150 cursor-default">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm ${
          isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <i className={`fas ${tx.categoryIcon}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
          {tx.description}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <BankBadge name={tx.bank} color={tx.bankColor} />
          <span className="text-[0.65rem] text-slate-400">{tx.formattedDate}</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-sm font-bold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-slate-800'}`}>
          {tx.formattedAmount}
        </p>
        <p className="text-[0.65rem] text-slate-400 mt-0.5">{tx.category}</p>
      </div>
    </li>
  );
}

export default function RecentActivity() {
  const transactions = mockTransactions;

  return (
    <section aria-label="Atividade recente" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Atividade Recente</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Via Open Finance · {transactions.length} transações</p>
        </div>

        <Link
          id="recent-activity-view-all"
          to="/dashboard/expenses#transacoes"
          className="text-[0.75rem] font-semibold text-cc-green hover:text-cc-dark-green hover:underline underline-offset-2 transition-colors flex items-center gap-1"
        >
          Ver todas
          <ArrowRight size={13} strokeWidth={2.2} />
        </Link>
      </div>

      <ul className="divide-y divide-slate-50">
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </ul>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-[0.7rem] text-slate-400 font-medium">
          Dados importados automaticamente pelo Open Finance
        </p>
      </div>
    </section>
  );
}
