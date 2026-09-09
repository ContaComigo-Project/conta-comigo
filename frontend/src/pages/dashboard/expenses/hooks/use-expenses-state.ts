import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiSource, mesCorrente } from '../../../../data/api-source';
import { paraTransactions } from '../../../../data/mappers';
import { CATEGORIAS } from '../../../../data/presentation';
import { useMountedAnimation } from '../../../../hooks/use-mounted-animation';
import type { Transaction } from '../../../../data/transaction';
import type { ViewMode } from '../components/SegmentedViewToggle';
import { bandFromCounts, FILTER_BANDS, type Band } from '../band';

// Real expenses data (HT-018 part 2). Bands come ready from the backend
// (RN-001); here we only aggregate and sort for presentation. No threshold.
export interface CategoryOfMonth {
  category: string;
  name: string;
  icon: string;
  color: string;
  limitInCents: number | null;
  spentInCents: number;
  band: Band;
  percentage: number;
  trend: number | null;
}

export interface MonthSummary {
  month: string;
  label: string;
  fullLabel: string;
  current: boolean;
  totalSpent: number;
  totalLimit: number;
  percentage: number;
  status: Band;
  counts: Record<Band, number>;
}

export interface MonthInfo {
  month: string;
  label: string;
  fullLabel: string;
  current: boolean;
}

export type EditState = Record<string, number>;
export type QuickFilter = 'todas' | Band;

const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function monthInfo(month: string, agora: string = mesCorrente()): MonthInfo {
  const [ano, mes] = month.split('-').map(Number);
  return {
    month,
    label: MONTHS_SHORT[mes - 1],
    fullLabel: `${MONTHS_PT[mes - 1]} ${ano}`,
    current: month === agora,
  };
}

function monthOfDate(date: Date): string {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric' }).formatToParts(date);
  const ano = p.find((x) => x.type === 'year')?.value ?? '2026';
  const mes = p.find((x) => x.type === 'month')?.value ?? '1';
  return `${ano}-${mes.padStart(2, '0')}`;
}

function toCategory(cat: { category: string; limitInCents: number | null; spentInCents: number; band: string }): CategoryOfMonth {
  const visual = CATEGORIAS[cat.category] ?? CATEGORIAS.outros;
  const limit = cat.limitInCents ?? 0;
  return {
    category: cat.category,
    name: visual.name,
    icon: visual.iconeNaLista,
    color: visual.cor,
    limitInCents: cat.limitInCents,
    spentInCents: cat.spentInCents,
    band: cat.band as Band,
    percentage: limit > 0 ? (cat.spentInCents / limit) * 100 : 0,
    trend: null,
  };
}

export interface UseExpensesStateResult {
  problems: Array<{ category: string; vezesEmVermelho: number; excessoTotalEmCentavos: number }>;
  loading: boolean;
  errored: boolean;
  months: string[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  editingIds: Set<string>;
  drafts: EditState;
  saveError: string | null;
  animate: boolean;
  filter: QuickFilter;
  setFilter: (f: QuickFilter) => void;
  transactionsSectionRef: React.MutableRefObject<HTMLDivElement | null>;
  selectedMonthInfo: MonthInfo;
  summaries: MonthSummary[];
  currentCats: CategoryOfMonth[];
  currentTxs: Transaction[];
  currentSummary: MonthSummary;
  filtered: CategoryOfMonth[];
  transactionsByCategory: Map<string, Transaction[]>;
  enterEdit: (id: string, limit: number) => void;
  cancelEdit: (id: string) => void;
  applyDraft: (id: string) => Promise<void>;
  nudgeDraft: (id: string, currentLimit: number, delta: number) => void;
  setDraftValue: (id: string, currentLimit: number, raw: string) => void;
  removeLimit: (id: string) => Promise<void>;
  goPrev: () => void;
  goNext: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
}

export function useExpensesState(): UseExpensesStateResult {
  const [selectedMonth, setSelectedMonth] = useState<string>(mesCorrente());
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<EditState>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [dataByMonth, setDataByMonth] = useState<Record<string, CategoryOfMonth[]>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [problems, setProblems] = useState<Array<{ category: string; vezesEmVermelho: number; excessoTotalEmCentavos: number }>>([]);
  const animate = useMountedAnimation(80, [selectedMonth, viewMode]);
  const [filter, setFilter] = useState<QuickFilter>('todas');
  const transactionsSectionRef = useRef<HTMLDivElement | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    try {
      const api = new ApiSource();
      const [history, txs, semaphore] = await Promise.all([
        api.historico(),
        api.listarTransactions(),
        api.semaphoreDoMes(mesCorrente()),
      ]);
      const byMonth: Record<string, CategoryOfMonth[]> = {};
      for (const m of (history as { meses: Array<{ month: string; categorias: Array<{ category: string; limitInCents: number | null; spentInCents: number; band: string }> }> }).meses) {
        byMonth[m.month] = m.categorias.map(toCategory);
      }
      byMonth[semaphore.month] = semaphore.categorias.map(toCategory);
      setDataByMonth(byMonth);
      setProblems(history.problemas.map((p) => ({ category: p.category, vezesEmVermelho: p.vezesEmVermelho, excessoTotalEmCentavos: p.excessoTotalEmCentavos })));
      setTransactions(txs.estado === 'ok' ? paraTransactions(txs.dados, new Date()) : []);
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#transacoes') {
      const r = transactionsSectionRef.current;
      if (r) r.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, []);

  const months = useMemo(() => {
    const base = Object.keys(dataByMonth);
    if (!base.includes(mesCorrente())) base.push(mesCorrente());
    return base.sort().reverse();
  }, [dataByMonth]);

  const summaries = useMemo<MonthSummary[]>(
    () =>
      months.map((month) => {
        const cats = dataByMonth[month] ?? [];
        const withLimit = cats.filter((c) => c.limitInCents !== null);
        const totalSpent = withLimit.reduce((s, c) => s + c.spentInCents, 0);
        const totalLimit = withLimit.reduce((s, c) => s + (c.limitInCents ?? 0), 0);
        const counts = cats.reduce(
          (acc, c) => ({ ...acc, [c.band]: acc[c.band] + 1 }),
          { green: 0, amber: 0, red: 0, 'no-limit': 0 } as Record<Band, number>,
        );
        const info = monthInfo(month);
        return {
          month,
          label: info.label,
          fullLabel: info.fullLabel,
          current: info.current,
          totalSpent,
          totalLimit,
          percentage: totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0,
          status: bandFromCounts(counts),
          counts,
        };
      }),
    [months, dataByMonth],
  );

  const currentCats = dataByMonth[selectedMonth] ?? [];
  const currentTxs = useMemo(
    () => transactions.filter((t) => monthOfDate(t.date) === selectedMonth && t.amount < 0),
    [transactions, selectedMonth],
  );
  const currentSummary = summaries.find((s) => s.month === selectedMonth) ?? summaries[0];

  const filtered = useMemo(() => {
    const order: Record<Band, number> = { red: 0, amber: 1, green: 2, 'no-limit': 3 };
    const sorted = [...currentCats].sort((a, b) => {
      const diff = order[a.band] - order[b.band];
      if (diff !== 0) return diff;
      return b.percentage - a.percentage;
    });
    if (filter === 'todas') return sorted;
    return sorted.filter((c) => c.band === filter);
  }, [currentCats, filter]);

  const transactionsByCategory = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of currentTxs) {
      const cat = currentCats.find((c) => (tx.categoryId ? c.category === tx.categoryId : c.name === tx.category));
      if (cat) {
        if (!map.has(cat.category)) map.set(cat.category, []);
        map.get(cat.category)!.push(tx);
      }
    }
    return map;
  }, [currentCats, currentTxs]);

  const enterEdit = (id: string, limit: number) => {
    setEditingIds((s) => new Set(s).add(id));
    setDrafts((d) => (id in d ? d : { ...d, [id]: limit }));
  };

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

  const applyDraft = async (id: string) => {
    const draft = drafts[id];
    if (typeof draft !== 'number' || draft <= 0) return;
    setSaveError(null);
    try {
      await new ApiSource().definirLimite(selectedMonth, id, Math.round(draft * 100));
      cancelEdit(id);
      await reload();
    } catch {
      setSaveError('Não foi possível salvar o limite agora.');
    }
  };

  const removeLimit = async (id: string) => {
    setSaveError(null);
    try {
      await new ApiSource().removerLimite(selectedMonth, id);
      await reload();
    } catch {
      setSaveError('Não foi possível remover o limite agora.');
    }
  };

  const nudgeDraft = (id: string, currentLimit: number, delta: number) => {
    enterEdit(id, currentLimit);
    setDrafts((prev) => {
      const base = prev[id] ?? currentLimit;
      return { ...prev, [id]: +(base + delta).toFixed(2) };
    });
  };

  const setDraftValue = (id: string, currentLimit: number, raw: string) => {
    enterEdit(id, currentLimit);
    const v = parseFloat(raw);
    const val = Number.isFinite(v) ? v : 0;
    setDrafts((prev) => ({ ...prev, [id]: val }));
  };

  const goPrev = () => {
    const i = months.findIndex((m) => m === selectedMonth);
    if (i > 0) setSelectedMonth(months[i - 1]);
  };
  const goNext = () => {
    const i = months.findIndex((m) => m === selectedMonth);
    if (i < months.length - 1) setSelectedMonth(months[i + 1]);
  };

  const isAtStart = months[0] === selectedMonth;
  const isAtEnd = months[months.length - 1] === selectedMonth;

  const selectedMonthInfo = monthInfo(selectedMonth);

  return {
    problems, loading, errored, months,
    selectedMonth, setSelectedMonth,
    viewMode, setViewMode,
    editingIds, drafts, saveError,
    animate, filter, setFilter,
    transactionsSectionRef,
    selectedMonthInfo,
    summaries, currentCats, currentTxs, currentSummary,
    filtered, transactionsByCategory,
    enterEdit, cancelEdit, applyDraft,
    nudgeDraft, setDraftValue, removeLimit,
    goPrev, goNext, isAtStart, isAtEnd,
  };
}

export { FILTER_BANDS };