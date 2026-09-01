import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BUDGET_BY_MONTH,
  TRANSACTIONS_BY_MONTH,
  MONTHS,
  MONTH_SUMMARIES,
  recomputeCategory,
  resolveStatus,
  type BudgetCategory,
  type BudgetStatus,
  type MonthSlug,
  type MonthSummary,
  type Transaction,
} from '../../../../mocks';
import { useMountedAnimation } from '../../../../hooks/use-mounted-animation';
import type { ViewMode } from '../components/SegmentedViewToggle';

export type EditState = Record<string, number>;
export type QuickFilter = 'todas' | BudgetStatus;
export type LimitOverrides = Record<MonthSlug, Record<string, number>>;

export interface UseExpensesStateResult {
  selectedMonth: MonthSlug;
  setSelectedMonth: (m: MonthSlug) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  overrides: LimitOverrides;
  editingIds: Set<string>;
  drafts: EditState;
  animate: boolean;
  filter: QuickFilter;
  setFilter: (f: QuickFilter) => void;
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  transactionsSectionRef: React.MutableRefObject<HTMLDivElement | null>;
  selectedMonthInfo: (typeof MONTHS)[number];
  categoriesForMonth: Record<MonthSlug, BudgetCategory[]>;
  summaries: MonthSummary[];
  currentCats: BudgetCategory[];
  currentTxs: Transaction[];
  currentSummary: MonthSummary;
  filtered: BudgetCategory[];
  transactionsByCategory: Map<string, Transaction[]>;
  ensureEditing: (id: string, currentLimit: number) => void;
  enterEdit: (id: string, limit: number) => void;
  cancelEdit: (id: string) => void;
  applyDraft: (id: string) => void;
  nudgeDraft: (id: string, currentLimit: number, delta: number) => void;
  setDraftValue: (id: string, currentLimit: number, raw: string) => void;
  applySuggested: (id: string, suggested: number) => void;
  goPrev: () => void;
  goNext: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}

export function useExpensesState(): UseExpensesStateResult {
  const [selectedMonth, setSelectedMonth] = useState<MonthSlug>('jun');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [overrides, setOverrides] = useState<LimitOverrides>({
    jan: {}, fev: {}, mar: {}, abr: {}, mai: {}, jun: {},
  });
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<EditState>({});
  const animate = useMountedAnimation(80, [selectedMonth, viewMode]);
  const [filter, setFilter] = useState<QuickFilter>('todas');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const transactionsSectionRef = useRef<HTMLDivElement | null>(null);

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

  return {
    selectedMonth, setSelectedMonth,
    viewMode, setViewMode,
    overrides, editingIds, drafts,
    animate, filter, setFilter,
    showSuggestions, setShowSuggestions,
    transactionsSectionRef,
    selectedMonthInfo,
    categoriesForMonth, summaries,
    currentCats, currentTxs, currentSummary,
    filtered, transactionsByCategory,
    ensureEditing, enterEdit, cancelEdit, applyDraft,
    nudgeDraft, setDraftValue, applySuggested,
    goPrev, goNext, isAtStart, isAtEnd,
  };
}
