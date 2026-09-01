import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { BUDGET_STATUS_META, type BudgetCategory, type Transaction } from '../../../../mocks';
import { formatBRL } from '../../../../utils/formatters';

interface TransactionsListViewProps {
  label: string;
  transactions: Transaction[];
  cats: BudgetCategory[];
}

export function TransactionsListView({ label, transactions, cats }: TransactionsListViewProps) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const paged = transactions.slice(start, start + PAGE_SIZE);
  const total = transactions.length;
  const fromLabel = Math.min(start + 1, total);
  const toLabel = Math.min(start + PAGE_SIZE, total);

  return (
    <section className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Transações de {label}</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">
            Mostrando {fromLabel}–{toLabel} de {total} saídas · total de R${' '}
            {formatBRL(Math.abs(transactions.reduce((s, t) => s + t.amount, 0)))}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
          <Sparkles size={13} strokeWidth={2} color="#36b37e" />
          <span className="text-[0.68rem] font-semibold text-slate-500">IA Semântica</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {paged.map((tx) => {
          const cat = cats.find((c) => c.name === tx.category);
          const meta = cat ? BUDGET_STATUS_META[cat.status] : null;
          return (
            <div key={tx.id} className="flex items-center gap-3 py-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: cat ? `${cat.color}15` : '#f1f5f9' }}
              >
                <i
                  className={`fas ${tx.categoryIcon}`}
                  style={{ color: cat?.color ?? '#64748b' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[0.82rem] font-semibold text-slate-800 truncate">
                    {tx.description}
                  </p>
                  {meta && (
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[0.58rem] font-bold uppercase border ${meta.badgeClass}`}
                    >
                      <meta.Icon size={8.5} strokeWidth={2.5} />
                      {meta.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[0.7rem] text-slate-500">
                  <span>{tx.category}</span>
                  <span>·</span>
                  <span>{tx.formattedDate}</span>
                  <span>·</span>
                  <span className="font-medium">{tx.bank}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[0.82rem] font-bold tabular-nums text-slate-800">
                  {tx.formattedAmount}
                </div>
                <div className="text-[0.65rem] text-slate-400">
                  {cat ? `${cat.percentage.toFixed(0)}% da categoria` : '-'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[0.7rem] text-slate-500 font-medium">
            Página <span className="font-bold text-slate-700 tabular-nums">{page + 1}</span> de{' '}
            <span className="font-bold text-slate-700 tabular-nums">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-[0.7rem] font-bold cursor-pointer"
              aria-label="Primeira página"
            >
              «
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} strokeWidth={2.2} />
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const active = idx === page;
                const nearFirst = idx <= 1;
                const nearLast = idx >= totalPages - 2;
                const nearCurrent = Math.abs(idx - page) <= 1;
                if (!nearFirst && !nearLast && !nearCurrent) {
                  if (idx === 2 || idx === totalPages - 3) {
                    return (
                      <span
                        key={`dots-${idx}`}
                        className="text-slate-400 text-xs px-1"
                        aria-hidden
                      >
                        …
                      </span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPage(idx)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-8 h-8 rounded-lg text-[0.75rem] font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-sm shadow-cc-green/20'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Próxima página"
            >
              <ChevronRight size={14} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages - 1)}
              disabled={page === totalPages - 1}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-[0.7rem] font-bold cursor-pointer"
              aria-label="Última página"
            >
              »
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
