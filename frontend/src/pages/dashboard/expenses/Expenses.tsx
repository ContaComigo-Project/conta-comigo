import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Pencil,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  ListTree,
  LayoutGrid,
  ArrowUpRight,
} from 'lucide-react';
import {
  BUDGET_BY_MONTH,
  TRANSACTIONS_BY_MONTH,
  MONTHS,
  MONTH_SUMMARIES,
  type BudgetCategory,
  type BudgetStatus,
  type MonthSlug,
  type MonthSummary,
  type Transaction,
} from '../../../mocks';

const STATUS_META: Record<BudgetStatus, {
  label: string;
  short: string;
  Icon: typeof CheckCircle2;
  barClass: string;
  badgeClass: string;
  ringClass: string;
  softBg: string;
  textClass: string;
  dotClass: string;
}> = {
  verde: {
    label: 'Verde',
    short: 'OK',
    Icon: CheckCircle2,
    barClass: 'bg-linear-to-t from-emerald-600 to-emerald-400',
    badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    ringClass: 'ring-emerald-200',
    softBg: 'bg-emerald-50',
    textClass: 'text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  amarelo: {
    label: 'Atenção',
    short: 'Atenção',
    Icon: AlertTriangle,
    barClass: 'bg-linear-to-t from-amber-500 to-amber-300',
    badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200',
    ringClass: 'ring-amber-200',
    softBg: 'bg-amber-50',
    textClass: 'text-amber-600',
    dotClass: 'bg-amber-400',
  },
  vermelho: {
    label: 'Estourado',
    short: 'Estouro',
    Icon: XCircle,
    barClass: 'bg-linear-to-t from-red-600 to-red-400',
    badgeClass: 'text-red-700 bg-red-50 border border-red-200',
    ringClass: 'ring-red-200',
    softBg: 'bg-red-50',
    textClass: 'text-red-600',
    dotClass: 'bg-red-500',
  },
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function resolveStatus(percentage: number): BudgetStatus {
  if (percentage <= 70) return 'verde';
  if (percentage <= 90) return 'amarelo';
  return 'vermelho';
}

function recomputeCategory(c: BudgetCategory, newLimit: number): BudgetCategory {
  const limit = Math.max(1, newLimit);
  const percentage = Math.min(200, +((c.spent / limit) * 100).toFixed(1));
  const remaining = Math.max(0, +(limit - c.spent).toFixed(2));
  return { ...c, limit, percentage, remaining, status: resolveStatus(percentage) };
}

type ViewMode = 'single' | 'history';
type EditState = Record<string, number>;

export default function Expenses() {
  const [selectedMonth, setSelectedMonth] = useState<MonthSlug>('jun');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [overrides, setOverrides] = useState<Record<MonthSlug, Record<string, number>>>({
    jan: {},
    fev: {},
    mar: {},
    abr: {},
    mai: {},
    jun: {},
  });
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<EditState>({});
  const [animate, setAnimate] = useState(false);
  const [filter, setFilter] = useState<'todas' | BudgetStatus>('todas');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const transactionsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(t);
  }, [selectedMonth, viewMode]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#transacoes') {
      const r = transactionsSectionRef.current;
      if (r) r.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, []);

  const selectedMonthInfo = useMemo(
    () => MONTHS.find((m) => m.slug === selectedMonth)!,
    [selectedMonth]
  );

  const categoriesForMonth = useMemo((): Record<MonthSlug, BudgetCategory[]> => {
    const result = {} as Record<MonthSlug, BudgetCategory[]>;
    for (const m of MONTHS.map((x) => x.slug)) {
      const monthOverrides = overrides[m] ?? {};
      result[m] = BUDGET_BY_MONTH[m].map((c) =>
        monthOverrides[c.id] ? recomputeCategory(c, monthOverrides[c.id]) : c
      );
    }
    return result;
  }, [overrides]);

  const summaries = useMemo((): MonthSummary[] => {
    return MONTH_SUMMARIES.map((s) => {
      const cats = categoriesForMonth[s.slug];
      const totalSpent = +cats.reduce((acc, c) => acc + c.spent, 0).toFixed(2);
      const totalLimit = cats.reduce((acc, c) => acc + c.limit, 0);
      const percentage = (totalSpent / totalLimit) * 100;
      const counts = cats.reduce(
        (acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }),
        { verde: 0, amarelo: 0, vermelho: 0 }
      );
      const topCategory = [...cats].sort((a, b) => b.percentage - a.percentage)[0];
      return {
        ...s,
        totalSpent,
        totalLimit,
        percentage,
        status: resolveStatus(percentage),
        counts,
        topCategory,
      };
    });
  }, [categoriesForMonth]);

  const currentCats = categoriesForMonth[selectedMonth];
  const currentTxs = TRANSACTIONS_BY_MONTH[selectedMonth];
  const currentSummary = summaries.find((s) => s.slug === selectedMonth)!;

  const filtered = useMemo(() => {
    const sorted = [...currentCats].sort((a, b) => {
      const order: Record<BudgetStatus, number> = { vermelho: 0, amarelo: 1, verde: 2 };
      const statusDiff = order[a.status] - order[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.percentage - a.percentage;
    });
    if (filter === 'todas') return sorted;
    return sorted.filter((c) => c.status === filter);
  }, [currentCats, filter]);

  const transactionsByCategory = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of currentTxs) {
      const cat = currentCats.find((c) => c.name === tx.category);
      if (cat) {
        if (!map.has(cat.id)) map.set(cat.id, []);
        map.get(cat.id)!.push(tx);
      }
    }
    return map;
  }, [currentCats, currentTxs]);

  const ensureEditing = (id: string, currentLimit: number) => {
    setEditingIds((s) => new Set(s).add(id));
    setDrafts((d) => (id in d ? d : { ...d, [id]: currentLimit }));
  };

  const enterEdit = (id: string, limit: number) => ensureEditing(id, limit);

  const cancelEdit = (id: string) => {
    setEditingIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    setDrafts((d) => {
      if (!(id in d)) return d;
      const n = { ...d };
      delete n[id];
      return n;
    });
  };

  const applyDraft = (id: string) => {
    const draft = drafts[id];
    if (typeof draft !== 'number') return;
    setOverrides((prev) => ({
      ...prev,
      [selectedMonth]: { ...(prev[selectedMonth] ?? {}), [id]: draft },
    }));
    cancelEdit(id);
  };

  const nudgeDraft = (id: string, currentLimit: number, delta: number) => {
    ensureEditing(id, currentLimit);
    setDrafts((prev) => {
      const base = prev[id] ?? currentLimit;
      return { ...prev, [id]: +(base + delta).toFixed(2) };
    });
  };

  const setDraftValue = (id: string, currentLimit: number, raw: string) => {
    ensureEditing(id, currentLimit);
    const v = parseFloat(raw);
    const val = Number.isFinite(v) ? v : 0;
    setDrafts((prev) => ({ ...prev, [id]: val }));
  };

  const applySuggested = (id: string, suggested: number) => {
    setOverrides((prev) => ({
      ...prev,
      [selectedMonth]: { ...(prev[selectedMonth] ?? {}), [id]: suggested },
    }));
  };

  const goPrev = () => {
    const i = MONTHS.findIndex((m) => m.slug === selectedMonth);
    if (i > 0) setSelectedMonth(MONTHS[i - 1].slug);
  };
  const goNext = () => {
    const i = MONTHS.findIndex((m) => m.slug === selectedMonth);
    if (i < MONTHS.length - 1) setSelectedMonth(MONTHS[i + 1].slug);
  };

  const isAtStart = MONTHS[0].slug === selectedMonth;
  const isAtEnd = MONTHS[MONTHS.length - 1].slug === selectedMonth;

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
          <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${
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
              onClick={() => setViewMode('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-all ${
                viewMode === 'history'
                  ? 'bg-[#36b37e] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ListTree size={14} strokeWidth={2} />
              Histórico (todos os meses)
            </button>
          </div>
        </div>
      </header>

      {viewMode === 'single' ? (
        <>
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl p-4 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-center sm:justify-start gap-3 flex-1">
              <button
                type="button"
                onClick={goPrev}
                disabled={isAtStart}
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={17} strokeWidth={2.2} />
              </button>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {MONTHS.map((m) => {
                  const s = summaries.find((sum) => sum.slug === m.slug)!;
                  const meta = STATUS_META[s.status];
                  const isSelected = m.slug === selectedMonth;
                  return (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => setSelectedMonth(m.slug)}
                      className={`group flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                        isSelected
                          ? `bg-linear-to-br from-cc-dark-green to-cc-green text-white border-transparent shadow-md shadow-cc-green/20`
                          : `bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:shadow-sm`
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[0.7rem] font-bold ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                          {m.year}
                        </span>
                        {m.current && (
                          <span className={`text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-px rounded-full ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            atual
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold leading-none">{m.label}</span>
                      <div className={`flex items-center gap-1.5 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : meta.dotClass}`} />
                        <span className="text-[0.65rem] font-semibold tabular-nums">{s.percentage.toFixed(0)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={isAtEnd}
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRight size={17} strokeWidth={2.2} />
              </button>
            </div>
          </section>

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
                  {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((s) => {
                    const m = STATUS_META[s];
                    const count = currentSummary.counts[s];
                    return (
                      <div key={s} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10">
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
                  {formatBRL(currentCats.reduce((s, c) => s + c.suggestedLimit, 0))}
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
                    R$ {formatBRL(currentSummary.totalLimit - currentCats.reduce((s, c) => s + c.suggestedLimit, 0))}
                  </strong>{' '}
                  vs. limites atuais.
                </span>
              </div>
            </article>

            <article className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
              <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Filtros rápidos
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilter('todas')}
                  className={`text-[0.72rem] font-semibold px-2.5 py-1.5 rounded-lg transition-all border ${
                    filter === 'todas'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas ({currentCats.length})
                </button>
                {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((f) => {
                  const m = STATUS_META[f];
                  const active = filter === f;
                  const count = currentSummary.counts[f];
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`text-[0.72rem] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border ${
                        active ? `${m.badgeClass} ring-2 ${m.ringClass}` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <m.Icon size={12} strokeWidth={2.3} />
                      {m.label} ({count})
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSuggestions((v) => !v)}
                  className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-slate-600"
                >
                  {showSuggestions ? (
                    <ChevronUp size={12} strokeWidth={2.2} />
                  ) : (
                    <ChevronDown size={12} strokeWidth={2.2} />
                  )}
                  Mostrar sugestões da IA
                </button>
              </div>
            </article>
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
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.verde.dotClass}`} />
                  0–70%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.amarelo.dotClass}`} />
                  70–90%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.vermelho.dotClass}`} />
                  {' > '}90%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 pb-3">
              {filtered.map((c) => {
                const isEditingLocal = editingIds.has(c.id);
                const draftLimit = drafts[c.id] ?? c.limit;
                const draftPct = Math.min(
                  200,
                  +((c.spent / Math.max(1, draftLimit)) * 100).toFixed(1)
                );
                const displayPct = isEditingLocal ? draftPct : c.percentage;
                const displayStatus = isEditingLocal ? resolveStatus(displayPct) : c.status;
                const barHeight = Math.min(100, displayPct);
                const overflowPct = displayPct > 100 ? Math.min(40, displayPct - 100) : 0;
                const meta = STATUS_META[displayStatus];
                const relatedTxs = transactionsByCategory.get(c.id) ?? [];

                return (
                  <article
                    key={c.id}
                    className={`relative flex flex-col rounded-2xl border transition-all duration-300 p-4 ${
                      isEditingLocal
                        ? `${meta.softBg} border-slate-200 shadow-[0_0_0_3px_rgba(54,179,126,0.08)]`
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-[0_6px_20px_rgba(15,23,42,0.05)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${c.color}15` }}
                        >
                          <i className={`fas ${c.icon}`} style={{ color: c.color }} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[0.82rem] font-bold text-slate-800 truncate">{c.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[0.58rem] font-bold uppercase border ${meta.badgeClass}`}
                            >
                              <meta.Icon size={8.5} strokeWidth={2.5} />
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          editingIds.has(c.id) ? cancelEdit(c.id) : enterEdit(c.id, c.limit)
                        }
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          editingIds.has(c.id)
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                        aria-label={editingIds.has(c.id) ? 'Cancelar edição' : 'Editar limite'}
                      >
                        {editingIds.has(c.id) ? (
                          <X size={13} strokeWidth={2.3} />
                        ) : (
                          <Pencil size={13} strokeWidth={2.1} />
                        )}
                      </button>
                    </div>

                    <div className="relative h-36 mb-3 flex items-end justify-center">
                      <div className="relative w-14 h-full">
                        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-24 h-px border-t border-dashed border-amber-300/80 pointer-events-none" />
                        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-24 h-px border-t border-dashed border-red-300/80 pointer-events-none" />
                        <div className="absolute inset-0 border-l-2 border-r-2 border-dashed border-slate-300/70 pointer-events-none" />

                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-full rounded-t-lg overflow-hidden bg-slate-50 border border-slate-100">
                          {overflowPct > 0 && (
                            <div
                              className="absolute left-0 right-0 top-0 bg-red-500/30 border-b-2 border-red-500 transition-all duration-1200 ease-out"
                              style={{
                                height: animate ? `${(overflowPct / 40) * 20}%` : '0%',
                              }}
                            />
                          )}
                          <div
                            className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-1200 ease-out ${meta.barClass} shadow-[0_-2px_10px_rgba(0,0,0,0.08)]`}
                            style={{ height: animate ? `${barHeight}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-center mb-3">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-[0.7rem] font-semibold text-slate-400">R$</span>
                        <span className="text-base font-bold text-slate-800 tabular-nums">
                          {formatBRL(c.spent)}
                        </span>
                      </div>

                      {isEditingLocal ? (
                        <div className="mt-2 flex items-center justify-center">
                          <div className="flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => nudgeDraft(c.id, c.limit, -50)}
                              className="w-7 h-7 text-slate-600 hover:bg-slate-50 font-bold"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={draftLimit}
                              onChange={(e) => setDraftValue(c.id, c.limit, e.target.value)}
                              className="w-20 text-center text-[0.78rem] font-bold tabular-nums outline-none py-1 border-x border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => nudgeDraft(c.id, c.limit, 50)}
                              className="w-7 h-7 text-slate-600 hover:bg-slate-50 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[0.7rem] text-slate-500 mt-0.5">
                          limite{' '}
                          <span className="font-bold text-slate-700 tabular-nums">
                            R$ {formatBRL(c.limit)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-1.5 mt-1.5">
                        <span className={`text-[0.72rem] font-bold tabular-nums ${meta.textClass}`}>
                          {displayPct.toFixed(0)}%
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[0.68rem] font-semibold ${
                            c.trend >= 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {c.trend >= 0 ? (
                            <TrendingUp size={10} strokeWidth={2.4} />
                          ) : (
                            <TrendingDown size={10} strokeWidth={2.4} />
                          )}
                          {c.trend >= 0 ? '+' : ''}
                          {c.trend}%
                        </span>
                      </div>
                    </div>

                    {showSuggestions && c.suggestedLimit !== c.limit && !isEditingLocal && (
                      <button
                        type="button"
                        onClick={() => applySuggested(c.id, c.suggestedLimit)}
                        className="w-full mb-2 flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-cc-green/5 border border-cc-green/15 hover:bg-cc-green/10 text-[0.68rem] font-semibold text-cc-dark-green transition-colors"
                      >
                        <span className="flex items-center gap-1">
                          <Sparkles size={11} strokeWidth={2.2} />
                          IA sugere R$ {formatBRL(c.suggestedLimit)}
                        </span>
                        <span className="text-[0.62rem] opacity-75">aplicar</span>
                      </button>
                    )}

                    {isEditingLocal && (
                      <div className="flex gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => applyDraft(c.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-linear-to-br from-cc-dark-green to-cc-green text-white text-[0.7rem] font-semibold hover:shadow-sm transition-all"
                        >
                          <Check size={12} strokeWidth={2.4} />
                          Aplicar
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEdit(c.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[0.7rem] font-semibold hover:bg-slate-50 transition-colors"
                        >
                          <X size={12} strokeWidth={2.4} />
                          Cancelar
                        </button>
                      </div>
                    )}

                    {relatedTxs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-slate-400">
                          Transações ({relatedTxs.length})
                        </p>
                        {relatedTxs.slice(0, 2).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between gap-2">
                            <span className="text-[0.7rem] text-slate-600 truncate">{tx.description}</span>
                            <span className="text-[0.7rem] font-semibold text-slate-700 tabular-nums">
                              {tx.formattedAmount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
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
          onSelectMonth={(s) => {
            setSelectedMonth(s);
            setViewMode('single');
          }}
          animate={animate}
        />
      )}
    </div>
  );
}

function TransactionsListView({
  label,
  transactions,
  cats,
}: {
  label: string;
  transactions: Transaction[];
  cats: BudgetCategory[];
}) {
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
          const meta = cat ? STATUS_META[cat.status] : null;
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

function HistoricalOverview({
  summaries,
  onSelectMonth,
  animate,
}: {
  summaries: MonthSummary[];
  onSelectMonth: (slug: MonthSlug) => void;
  animate: boolean;
}) {
  const maxSpent = Math.max(...summaries.map((s) => s.totalSpent));

  const avgSpent = +(summaries.reduce((s, m) => s + m.totalSpent, 0) / summaries.length).toFixed(2);
  const avgLimit = summaries.reduce((s, m) => s + m.totalLimit, 0) / summaries.length;
  const avgPct = (avgSpent / avgLimit) * 100;

  const trendPct = (() => {
    const first = summaries[0].totalSpent;
    const last = summaries[summaries.length - 1].totalSpent;
    return +(((last - first) / first) * 100).toFixed(1);
  })();

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-2xl p-5 bg-linear-to-br from-cc-dark-blue to-cc-dark-green text-white shadow-md shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative">
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-white/70 mb-1.5">
              Gasto médio 6 meses
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-white/80">R$</span>
              <span className="text-3xl font-bold tabular-nums tracking-tight">{formatBRL(avgSpent)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-white/15 ${
                  trendPct >= 0 ? 'text-amber-200' : 'text-emerald-200'
                }`}
              >
                {trendPct >= 0 ? (
                  <TrendingUp size={10} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={10} strokeWidth={2.5} />
                )}
                {trendPct >= 0 ? '+' : ''}
                {trendPct}% vs. Jan
              </span>
              <span className="text-[0.65rem] text-white/70">
                média {avgPct.toFixed(0)}% dos limites
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Status semáforo (total de categorias-mês)
          </p>
          <div className="space-y-2.5">
            {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((s) => {
              const m = STATUS_META[s];
              const total = summaries.reduce((acc, sum) => acc + sum.counts[s], 0);
              const pct = (total / (summaries.length * 6)) * 100;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-[0.7rem] mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <span className={`w-2 h-2 rounded-full ${m.dotClass}`} />
                      {m.label}
                    </div>
                    <span className="font-bold tabular-nums text-slate-800">
                      {total} <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${m.barClass} transition-all duration-1000 rounded-full`}
                      style={{ width: animate ? `${pct}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Top problemas recorrentes
          </p>
          <div className="space-y-2">
            {summaries
              .flatMap((s) =>
                s.counts.vermelho > 0
                  ? [{ label: s.label, slug: s.slug, cat: s.topCategory.name, pct: s.topCategory.percentage }]
                  : []
              )
              .sort((a, b) => b.pct - a.pct)
              .slice(0, 3)
              .map((issue, idx) => {
                return (
                  <button
                    key={issue.slug + idx}
                    type="button"
                    onClick={() => onSelectMonth(issue.slug as MonthSlug)}
                    className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-50/60 border border-red-100 hover:bg-red-50 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                        <XCircle size={13} strokeWidth={2.4} />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[0.75rem] font-bold text-slate-800 truncate">
                          {issue.label} · {issue.cat}
                        </p>
                        <p className="text-[0.65rem] text-slate-500">
                          {issue.pct.toFixed(0)}% do limite da categoria
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={13}
                      strokeWidth={2.2}
                      className="text-slate-400 group-hover:text-cc-dark-green transition-colors shrink-0"
                    />
                  </button>
                );
              })}
            {summaries.every((s) => s.counts.vermelho === 0) && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[0.75rem] text-emerald-700 font-medium">
                Nenhum mês estourou orçamento. Parabéns!
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Evolução mensal de gastos</h2>
            <p className="text-[0.72rem] text-slate-400 mt-0.5">
              Cada barra representa o total gasto do mês vs. o limite mensal consolidado.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[0.65rem] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-linear-to-t from-cc-dark-green to-cc-green" />
              Gasto
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm border-2 border-dashed border-slate-400" />
              Limite
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-end pb-2">
          {summaries.map((s) => {
            const meta = STATUS_META[s.status];
            const pctHeight = (s.totalSpent / maxSpent) * 100;
            const limitHeight = (s.totalLimit / maxSpent) * 100;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => onSelectMonth(s.slug)}
                className="group flex flex-col items-center gap-3 focus:outline-none"
              >
                <div className="relative w-full h-48 flex items-end justify-center">
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-12 border-t-2 border-dashed border-slate-300"
                    style={{ bottom: `${limitHeight}%` }}
                    title={`Limite R$ ${formatBRL(s.totalLimit)}`}
                  />

                  <div className="relative w-10 h-full flex items-end">
                    <div className="absolute inset-0 rounded-t-lg bg-slate-50 border border-slate-100" />
                    <div
                      className={`relative w-full rounded-t-lg ${meta.barClass} shadow-[0_-2px_12px_rgba(0,0,0,0.08)] transition-all duration-1000 ease-out group-hover:brightness-105`}
                      style={{ height: animate ? `${pctHeight}%` : '0%' }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900 text-white text-[0.62rem] font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
                        R$ {formatBRL(s.totalSpent)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                    <span className="text-[0.72rem] font-bold text-slate-800 tabular-nums">
                      {s.percentage.toFixed(0)}%
                    </span>
                    {MONTHS.find((m) => m.slug === s.slug)?.current && (
                      <span className="text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-px rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        atual
                      </span>
                    )}
                  </div>
                  <span className="text-[0.8rem] font-bold text-slate-700">{s.label}</span>
                  <span className="text-[0.65rem] text-slate-400 tabular-nums">
                    R$ {formatBRL(s.totalSpent)}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[0.55rem] font-semibold text-slate-400">
                      {s.counts.vermelho > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-red-600">
                          <XCircle size={8} strokeWidth={2.5} /> {s.counts.vermelho}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {summaries
          .slice()
          .reverse()
          .map((s) => {
            const meta = STATUS_META[s.status];
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => onSelectMonth(s.slug)}
                className="text-left rounded-2xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-[0_6px_20px_rgba(15,23,42,0.05)] transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-slate-800">{s.fullLabel}</h3>
                      {MONTHS.find((m) => m.slug === s.slug)?.current && (
                        <span className="text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-px rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          atual
                        </span>
                      )}
                    </div>
                    <p className="text-[0.7rem] text-slate-500">
                      R$ {formatBRL(s.totalSpent)} de R$ {formatBRL(s.totalLimit)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase border ${meta.badgeClass}`}>
                    <meta.Icon size={10} strokeWidth={2.5} />
                    {meta.label}
                  </span>
                </div>

                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${meta.barClass} transition-all duration-1000`}
                    style={{ width: animate ? `${Math.min(100, s.percentage)}%` : '0%' }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((st) => {
                    const m = STATUS_META[st];
                    return (
                      <div
                        key={st}
                        className="flex items-center justify-center gap-1 px-1.5 py-1 rounded-lg border border-slate-100 bg-slate-50"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${m.dotClass}`} />
                        <span className="text-[0.7rem] font-bold tabular-nums text-slate-700">
                          {s.counts[st]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${s.topCategory.color}15` }}
                    >
                      <i
                        className={`fas ${s.topCategory.icon} text-[0.65rem]`}
                        style={{ color: s.topCategory.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.68rem] text-slate-500 leading-tight">Categoria crítica</p>
                      <p className="text-[0.75rem] font-bold text-slate-800 truncate leading-tight">
                        {s.topCategory.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[0.75rem] font-bold tabular-nums ${meta.textClass}`}>
                      {s.topCategory.percentage.toFixed(0)}%
                    </p>
                    <p className="text-[0.6rem] text-slate-400">do limite</p>
                  </div>
                </div>
              </button>
            );
          })}
      </section>
    </div>
  );
}
