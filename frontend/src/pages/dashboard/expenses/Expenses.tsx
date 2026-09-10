import { Calendar, Info } from 'lucide-react';
import { formatBRL } from '../../../utils/formatters';
import { useExpensesState } from './hooks/use-expenses-state';
import { SegmentedViewToggle } from './components/SegmentedViewToggle';
import { ExportDropdown } from './components/ExportDropdown';
import { MonthPicker } from './components/MonthPicker';
import { QuickFilterBar } from './components/QuickFilterBar';
import { CategoryCard } from './components/CategoryCard';
import { TransactionsListView } from './components/TransactionsListView';
import { HistoricalOverview } from './components/HistoricalOverview';
import { BAND_META, FILTER_BANDS } from './band';
import { ApiSource } from '../../../data/api-source';

export default function Expenses() {
  const {
    loading, errored, months, problems,
    selectedMonth, setSelectedMonth,
    viewMode, setViewMode,
    editingIds, drafts, saveError,
    animate, filter, setFilter,
    transactionsSectionRef,
    selectedMonthInfo,
    summaries,
    currentCats, currentTxs, currentSummary,
    filtered, transactionsByCategory,
    enterEdit, cancelEdit, applyDraft,
    nudgeDraft, setDraftValue, removeLimit, refresh,
    goPrev, goNext, isAtStart, isAtEnd,
  } = useExpensesState();

  const corrigirCategoria = async (transactionId: string, category: string) => {
    const r = await new ApiSource().corrigirCategoria(transactionId, category);
    if (r.estado === 'ok') await refresh();
  };

  if (errored && currentCats.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-24 md:pb-8">
        <header>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Despesas & Orçamento</h1>
          <p className="text-sm text-slate-500 mt-1">
            Não foi possível carregar os dados agora. Tente novamente em instantes.
          </p>
        </header>
      </div>
    );
  }

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

      {saveError && (
        <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[0.75rem] text-red-700">
          {saveError}
        </p>
      )}

      {loading ? (
        <p className="text-[0.8rem] text-slate-400 animate-pulse">Carregando orçamento...</p>
      ) : viewMode === 'single' ? (
        <>
          <MonthPicker
            months={months}
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
                      currentSummary.status === 'red'
                        ? 'bg-red-300/30'
                        : currentSummary.status === 'amber'
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
                      currentSummary.status === 'red'
                        ? 'from-red-300 to-red-100'
                        : currentSummary.status === 'amber'
                          ? 'from-amber-200 to-amber-100'
                          : ''
                    }`}
                    style={{ width: animate ? `${Math.min(100, currentSummary.percentage)}%` : '0%' }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {FILTER_BANDS.map((st) => {
                    const m = BAND_META[st];
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
                <Info size={12} strokeWidth={2} color="#36b37e" />
                Limites ativos
              </div>
              <div className="text-2xl font-bold tabular-nums text-slate-800">
                {currentCats.filter((c) => c.limitInCents !== null).length}
                <span className="text-sm text-slate-400 font-semibold"> de {currentCats.length}</span>
              </div>
              <p className="text-[0.75rem] text-slate-500 mt-1.5 leading-relaxed">
                Categorias com limite definido no mês. Categorias sem limite não entram no consolidado.
              </p>
            </article>

            <QuickFilterBar
              totalCats={currentCats.length}
              counts={currentSummary.counts}
              filter={filter}
              setFilter={setFilter}
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
                  <span className={`w-1.5 h-1.5 rounded-full ${BAND_META.green.dotClass}`} />
                  0–70%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${BAND_META.amber.dotClass}`} />
                  70–90%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${BAND_META.red.dotClass}`} />
                  {' > '}90%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 pb-3">
              {filtered.map((c) => (
                <CategoryCard
                  key={c.category}
                  category={c}
                  isEditing={editingIds.has(c.category)}
                  draftLimit={drafts[c.category] ?? (c.limitInCents ?? 0) / 100}
                  animate={animate}
                  relatedTxs={transactionsByCategory.get(c.category) ?? []}
                  onToggleEdit={() =>
                    editingIds.has(c.category)
                      ? cancelEdit(c.category)
                      : enterEdit(c.category, (c.limitInCents ?? 0) / 100)
                  }
                  onApply={() => void applyDraft(c.category)}
                  onCancel={() => cancelEdit(c.category)}
                  onNudge={(delta) => nudgeDraft(c.category, (c.limitInCents ?? 0) / 100, delta)}
                  onSetDraft={(raw) => setDraftValue(c.category, (c.limitInCents ?? 0) / 100, raw)}
                  onRemoveLimit={() => void removeLimit(c.category)}
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
              onCorrigirCategoria={(id, cat) => void corrigirCategoria(id, cat)}
            />
          </div>
        </>
      ) : (
        <HistoricalOverview
          summaries={summaries}
          problems={problems}
          onSelectMonth={(month: string) => {
            setSelectedMonth(month);
            setViewMode('single');
          }}
          animate={animate}
        />
      )}
    </div>
  );
}