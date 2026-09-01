import { Calendar, Info, Sparkles } from 'lucide-react';
import { BUDGET_STATUS_META, type BudgetStatus, type MonthSlug } from '../../../mocks';
import { formatBRL } from '../../../utils/formatters';
import { useExpensesState } from './hooks/use-expenses-state';
import { SegmentedViewToggle } from './components/SegmentedViewToggle';
import { ExportDropdown } from './components/ExportDropdown';
import { MonthPicker } from './components/MonthPicker';
import { QuickFilterBar } from './components/QuickFilterBar';
import { CategoryCard } from './components/CategoryCard';
import { TransactionsListView } from './components/TransactionsListView';
import { HistoricalOverview } from './components/HistoricalOverview';

export default function Expenses() {
  const {
    selectedMonth, setSelectedMonth,
    viewMode, setViewMode,
    editingIds, drafts,
    animate, filter, setFilter,
    showSuggestions, setShowSuggestions,
    transactionsSectionRef,
    selectedMonthInfo,
    summaries,
    currentCats, currentTxs, currentSummary,
    filtered, transactionsByCategory,
    enterEdit, cancelEdit, applyDraft,
    nudgeDraft, setDraftValue, applySuggested,
    goPrev, goNext, isAtStart, isAtEnd,
  } = useExpensesState();

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            <Calendar size={12} strokeWidth={2} />
            {selectedMonthInfo.fullLabel}
          </div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            Despesas & Orçamento
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Visualize gastos por mês, compare categorias com seus limites e acompanhe tendências dos últimos meses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SegmentedViewToggle
            viewMode={viewMode}
            onChange={setViewMode}
          />
          <ExportDropdown
            viewMode={viewMode}
            labelSingle={selectedMonthInfo.fullLabel}
          />
        </div>
      </header>

      {viewMode === 'single' ? (
        <>
          <MonthPicker
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            summaries={summaries}
            goPrev={goPrev}
            goNext={goNext}
            isAtStart={isAtStart}
            isAtEnd={isAtEnd}
          />

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <article className="xl:col-span-2 rounded-2xl p-5 bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-md shadow-cc-green/15 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
              <div className="absolute bottom-0 -left-10 w-36 h-36 rounded-full bg-white/5" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/70">
                    Gasto do mês
                  </p>
                  {selectedMonthInfo.current && (
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider px-2 py-px rounded-full bg-white/20">
                      atual
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-semibold text-white/80">R$</span>
                  <span className="text-3xl font-bold tabular-nums tracking-tight">
                    {formatBRL(currentSummary.totalSpent)}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[0.8rem] text-white/70 tabular-nums">
                    de R$ {formatBRL(currentSummary.totalLimit)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-white/20 ${
                      currentSummary.status === 'vermelho'
                        ? 'bg-red-300/30'
                        : currentSummary.status === 'amarelo'
                        ? 'bg-amber-300/30'
                        : ''
                    }`}
                  >
                    {currentSummary.percentage.toFixed(0)}% utilizado
                  </span>
                </div>
                <div className="mt-4 h-2.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 bg-linear-to-r from-white/80 to-white ${
                      currentSummary.status === 'vermelho'
                        ? 'from-red-300 to-red-100'
                        : currentSummary.status === 'amarelo'
                        ? 'from-amber-200 to-amber-100'
                        : ''
                    }`}
                    style={{ width: animate ? `${Math.min(100, currentSummary.percentage)}%` : '0%' }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((st) => {
                    const m = BUDGET_STATUS_META[st];
                    const count = currentSummary.counts[st];
                    return (
                      <div key={st} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10">
                        <m.Icon size={14} strokeWidth={2.3} className="text-white/90" />
                        <div>
                          <div className="text-sm font-bold tabular-nums leading-none text-white">{count}</div>
                          <div className="text-[0.6rem] text-white/70 leading-none mt-0.5">{m.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>

            <article className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                <Sparkles size={12} strokeWidth={2} color="#36b37e" />
                Limite semântico (IA)
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-slate-400">R$</span>
                <span className="text-2xl font-bold tabular-nums text-slate-800">
                  {formatBRL(currentCats.reduce((sum, c) => sum + c.suggestedLimit, 0))}
                </span>
              </div>
              <p className="text-[0.75rem] text-slate-500 mt-1.5 leading-relaxed">
                Regra 50/30/20 adaptada ao seu perfil e histórico de 6 meses via Open Finance.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Info size={12} className="text-slate-400 shrink-0" strokeWidth={2.2} />
                <span className="text-[0.7rem] text-slate-500">
                  Diferença de{' '}
                  <strong className="text-slate-700 tabular-nums">
                    R$ {formatBRL(currentSummary.totalLimit - currentCats.reduce((sum, c) => sum + c.suggestedLimit, 0))}
                  </strong>{' '}
                  vs. limites atuais.
                </span>
              </div>
            </article>

            <QuickFilterBar
              totalCats={currentCats.length}
              counts={currentSummary.counts}
              filter={filter}
              setFilter={setFilter}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
            />
          </section>

          <section className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Limites por Categoria</h2>
                <p className="text-[0.72rem] text-slate-400 mt-0.5">
                  Barras verticais · {selectedMonthInfo.label} · Linhas tracejadas marcam 70% e 90% do limite.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[0.65rem] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${BUDGET_STATUS_META.verde.dotClass}`} />
                  0–70%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${BUDGET_STATUS_META.amarelo.dotClass}`} />
                  70–90%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${BUDGET_STATUS_META.vermelho.dotClass}`} />
                  {' > '}90%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 pb-3">
              {filtered.map((c) => (
                <CategoryCard
                  key={c.id}
                  category={c}
                  isEditing={editingIds.has(c.id)}
                  draftLimit={drafts[c.id] ?? c.limit}
                  animate={animate}
                  relatedTxs={transactionsByCategory.get(c.id) ?? []}
                  showSuggestions={showSuggestions}
                  onToggleEdit={() =>
                    editingIds.has(c.id) ? cancelEdit(c.id) : enterEdit(c.id, c.limit)
                  }
                  onApply={() => applyDraft(c.id)}
                  onCancel={() => cancelEdit(c.id)}
                  onNudge={(delta) => nudgeDraft(c.id, c.limit, delta)}
                  onSetDraft={(raw) => setDraftValue(c.id, c.limit, raw)}
                  onApplySuggested={() => applySuggested(c.id, c.suggestedLimit)}
                />
              ))}
            </div>
          </section>

          <div ref={transactionsSectionRef} id="transacoes">
            <TransactionsListView
              key={`${selectedMonth}-${viewMode}`}
              label={selectedMonthInfo.label}
              transactions={currentTxs}
              cats={currentCats}
            />
          </div>
        </>
      ) : (
        <HistoricalOverview
          summaries={summaries}
          onSelectMonth={(slug: MonthSlug) => {
            setSelectedMonth(slug);
            setViewMode('single');
          }}
          animate={animate}
        />
      )}
    </div>
  );
}
