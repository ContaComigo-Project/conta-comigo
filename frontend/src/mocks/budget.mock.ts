import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { mockTransactions, type Transaction } from './transactions.mock';

export type BudgetStatus = 'verde' | 'amarelo' | 'vermelho';

export interface BudgetStatusMeta {
  label: string;
  short: string;
  Icon: LucideIcon;
  barClass: string;
  badgeClass: string;
  ringClass: string;
  softBg: string;
  textClass: string;
  dotClass: string;
  progressTrackClass: string;
  progressFillClass: string;
}

export const BUDGET_STATUS_META: Record<BudgetStatus, BudgetStatusMeta> = {
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
    progressTrackClass: 'from-emerald-50 via-emerald-50 to-slate-50',
    progressFillClass: 'from-emerald-500 to-emerald-600',
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
    progressTrackClass: 'from-amber-50 via-amber-50 to-slate-50',
    progressFillClass: 'from-amber-400 to-amber-500',
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
    progressTrackClass: 'from-red-50 via-red-50 to-slate-50',
    progressFillClass: 'from-red-500 to-red-600',
  },
};

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  limit: number;
  suggestedLimit: number;
  percentage: number;
  status: BudgetStatus;
  remaining: number;
  trend: number;
  history: { month: string; spent: number }[];
}

const BUDGET_RULES = {
  verdeMax: 70,
  amareloMax: 90,
} as const;

export function resolveStatus(percentage: number): BudgetStatus {
  if (percentage <= BUDGET_RULES.verdeMax) return 'verde';
  if (percentage <= BUDGET_RULES.amareloMax) return 'amarelo';
  return 'vermelho';
}

export function recomputeCategory(c: BudgetCategory, newLimit: number): BudgetCategory {
  const limit = Math.max(1, newLimit);
  const percentage = Math.min(200, +((c.spent / limit) * 100).toFixed(1));
  const remaining = Math.max(0, +(limit - c.spent).toFixed(2));
  return { ...c, limit, percentage, remaining, status: resolveStatus(percentage) };
}

const rawBudgetCategories: Omit<BudgetCategory, 'percentage' | 'status' | 'remaining'>[] = [
  {
    id: 'budget_food',
    name: 'Alimentação',
    icon: 'fa-utensils',
    color: '#36b37e',
    spent: 1240.0,
    limit: 1400.0,
    suggestedLimit: 1275.0,
    trend: +28,
    history: [
      { month: 'Mai', spent: 968.0 },
      { month: 'Abr', spent: 972.5 },
      { month: 'Mar', spent: 952.0 },
    ],
  },
  {
    id: 'budget_transport',
    name: 'Transporte',
    icon: 'fa-car',
    color: '#0a6d42',
    spent: 820.5,
    limit: 900.0,
    suggestedLimit: 850.0,
    trend: -3,
    history: [
      { month: 'Mai', spent: 845.0 },
      { month: 'Abr', spent: 860.0 },
      { month: 'Mar', spent: 910.0 },
    ],
  },
  {
    id: 'budget_house',
    name: 'Moradia',
    icon: 'fa-house',
    color: '#219b66',
    spent: 950.0,
    limit: 950.0,
    suggestedLimit: 950.0,
    trend: +0.5,
    history: [
      { month: 'Mai', spent: 945.0 },
      { month: 'Abr', spent: 945.0 },
      { month: 'Mar', spent: 945.0 },
    ],
  },
  {
    id: 'budget_health',
    name: 'Saúde',
    icon: 'fa-heart-pulse',
    color: '#001b42',
    spent: 410.0,
    limit: 500.0,
    suggestedLimit: 450.0,
    trend: +12,
    history: [
      { month: 'Mai', spent: 365.0 },
      { month: 'Abr', spent: 340.0 },
      { month: 'Mar', spent: 390.0 },
    ],
  },
  {
    id: 'budget_entertainment',
    name: 'Lazer',
    icon: 'fa-gamepad',
    color: '#4ade80',
    spent: 310.4,
    limit: 500.0,
    suggestedLimit: 600.0,
    trend: -8,
    history: [
      { month: 'Mai', spent: 338.0 },
      { month: 'Abr', spent: 412.0 },
      { month: 'Mar', spent: 480.0 },
    ],
  },
  {
    id: 'budget_other',
    name: 'Outros',
    icon: 'fa-ellipsis',
    color: '#64748b',
    spent: 588.0,
    limit: 600.0,
    suggestedLimit: 550.0,
    trend: +5,
    history: [
      { month: 'Mai', spent: 560.0 },
      { month: 'Abr', spent: 530.0 },
      { month: 'Mar', spent: 570.0 },
    ],
  },
];

export const mockBudgetCategories: BudgetCategory[] = rawBudgetCategories.map((c) => {
  const percentage = Math.min(200, +((c.spent / c.limit) * 100).toFixed(1));
  const remaining = Math.max(0, +(c.limit - c.spent).toFixed(2));
  return { ...c, percentage, remaining, status: resolveStatus(percentage) };
});

export const MONTH_SLUGS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun'] as const;
export type MonthSlug = (typeof MONTH_SLUGS)[number];

export interface MonthInfo {
  slug: MonthSlug;
  label: string;
  fullLabel: string;
  year: number;
  monthIndex: number;
  current?: boolean;
}

export const MONTHS: MonthInfo[] = [
  { slug: 'jan', label: 'Jan', fullLabel: 'Janeiro 2026', year: 2026, monthIndex: 0 },
  { slug: 'fev', label: 'Fev', fullLabel: 'Fevereiro 2026', year: 2026, monthIndex: 1 },
  { slug: 'mar', label: 'Mar', fullLabel: 'Março 2026', year: 2026, monthIndex: 2 },
  { slug: 'abr', label: 'Abr', fullLabel: 'Abril 2026', year: 2026, monthIndex: 3 },
  { slug: 'mai', label: 'Mai', fullLabel: 'Maio 2026', year: 2026, monthIndex: 4 },
  { slug: 'jun', label: 'Jun', fullLabel: 'Junho 2026', year: 2026, monthIndex: 5, current: true },
];

const CATEGORY_TEMPLATES: Array<Omit<BudgetCategory, 'spent' | 'percentage' | 'status' | 'remaining' | 'trend' | 'history'>> = [
  { id: 'budget_food',          name: 'Alimentação', icon: 'fa-utensils',    color: '#36b37e', limit: 1400, suggestedLimit: 1275 },
  { id: 'budget_transport',     name: 'Transporte',  icon: 'fa-car',        color: '#0a6d42', limit: 900,  suggestedLimit: 850  },
  { id: 'budget_house',         name: 'Moradia',     icon: 'fa-house',      color: '#219b66', limit: 950,  suggestedLimit: 950  },
  { id: 'budget_health',        name: 'Saúde',       icon: 'fa-heart-pulse',color: '#001b42', limit: 500,  suggestedLimit: 450  },
  { id: 'budget_entertainment', name: 'Lazer',       icon: 'fa-gamepad',    color: '#4ade80', limit: 500,  suggestedLimit: 600  },
  { id: 'budget_other',         name: 'Outros',      icon: 'fa-ellipsis',   color: '#64748b', limit: 600,  suggestedLimit: 550  },
];

interface MonthSpent {
  budget_food: number;
  budget_transport: number;
  budget_house: number;
  budget_health: number;
  budget_entertainment: number;
  budget_other: number;
}

const SPENT_BY_MONTH: Record<MonthSlug, MonthSpent> = {
  jan: { budget_food: 980,  budget_transport: 940, budget_house: 945, budget_health: 360, budget_entertainment: 510, budget_other: 590 },
  fev: { budget_food: 935,  budget_transport: 920, budget_house: 945, budget_health: 310, budget_entertainment: 555, budget_other: 520 },
  mar: { budget_food: 952,  budget_transport: 910, budget_house: 945, budget_health: 390, budget_entertainment: 480, budget_other: 570 },
  abr: { budget_food: 972.5,budget_transport: 860, budget_house: 945, budget_health: 340, budget_entertainment: 412, budget_other: 530 },
  mai: { budget_food: 968,  budget_transport: 845, budget_house: 945, budget_health: 365, budget_entertainment: 338, budget_other: 560 },
  jun: { budget_food: 1240, budget_transport: 820.5,budget_house: 950, budget_health: 410, budget_entertainment: 310.4, budget_other: 588 },
};

function makeCategoryForMonth(template: typeof CATEGORY_TEMPLATES[number], slug: MonthSlug, spent: number): BudgetCategory {
  const idx = MONTHS.findIndex((m) => m.slug === slug);
  const prevSlug = idx > 0 ? MONTH_SLUGS[idx - 1] : null;
  const prevSpent = prevSlug ? SPENT_BY_MONTH[prevSlug][template.id as keyof MonthSpent] : spent;
  const trend = prevSpent === 0 ? 0 : +(((spent - prevSpent) / prevSpent) * 100).toFixed(1);
  const history = MONTH_SLUGS
    .slice(Math.max(0, idx - 3), idx)
    .map((s) => ({ month: MONTHS.find((m) => m.slug === s)!.label, spent: SPENT_BY_MONTH[s][template.id as keyof MonthSpent] }));
  const percentage = Math.min(200, +((spent / template.limit) * 100).toFixed(1));
  const remaining = Math.max(0, +(template.limit - spent).toFixed(2));
  return {
    ...template,
    spent,
    percentage,
    status: resolveStatus(percentage),
    remaining,
    trend,
    history,
  };
}

export const BUDGET_BY_MONTH: Record<MonthSlug, BudgetCategory[]> = Object.fromEntries(
  MONTH_SLUGS.map((slug) => [
    slug,
    CATEGORY_TEMPLATES.map((t) =>
      makeCategoryForMonth(t, slug, SPENT_BY_MONTH[slug][t.id as keyof MonthSpent])
    ),
  ])
) as Record<MonthSlug, BudgetCategory[]>;

export interface MonthSummary {
  slug: MonthSlug;
  label: string;
  fullLabel: string;
  totalSpent: number;
  totalLimit: number;
  percentage: number;
  status: BudgetStatus;
  counts: { verde: number; amarelo: number; vermelho: number };
  topCategory: BudgetCategory;
}

export const MONTH_SUMMARIES: MonthSummary[] = MONTHS.map((m) => {
  const cats = BUDGET_BY_MONTH[m.slug];
  const totalSpent = +cats.reduce((s, c) => s + c.spent, 0).toFixed(2);
  const totalLimit = cats.reduce((s, c) => s + c.limit, 0);
  const percentage = (totalSpent / totalLimit) * 100;
  const counts = cats.reduce(
    (acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }),
    { verde: 0, amarelo: 0, vermelho: 0 }
  );
  const topCategory = [...cats].sort((a, b) => b.percentage - a.percentage)[0];
  return {
    slug: m.slug,
    label: m.label,
    fullLabel: m.fullLabel,
    totalSpent,
    totalLimit,
    percentage,
    status: resolveStatus(percentage),
    counts,
    topCategory,
  };
});

const MERCHANT_POOL: Record<string, Array<{ desc: string; merchant: string; bank: string; bankColor: string; range: [number, number] }>> = {
  Alimentação: [
    { desc: 'Pão de Açúcar', merchant: 'Grupo Pão de Açúcar', bank: 'Itaú', bankColor: '#F97316', range: [180, 280] },
    { desc: 'Mercado Extra', merchant: 'Extra Hipermercados', bank: 'Nubank', bankColor: '#8B5CF6', range: [90, 220] },
    { desc: 'iFood', merchant: 'iFood Serviços', bank: 'Nubank', bankColor: '#8B5CF6', range: [40, 95] },
    { desc: 'Hortifruti', merchant: 'Hortifruti Natural', bank: 'Itaú', bankColor: '#F97316', range: [60, 140] },
  ],
  Transporte: [
    { desc: 'Uber', merchant: 'Uber Brasil', bank: 'Nubank', bankColor: '#8B5CF6', range: [25, 55] },
    { desc: '99 Pop', merchant: '99 Táxis', bank: 'Bradesco', bankColor: '#EF4444', range: [20, 45] },
    { desc: 'Posto Ipiranga', merchant: 'Posto Ipiranga', bank: 'Itaú', bankColor: '#F97316', range: [180, 280] },
    { desc: 'Metrô Bilhete', merchant: 'Metrô SP', bank: 'Bradesco', bankColor: '#EF4444', range: [50, 120] },
  ],
  Moradia: [
    { desc: 'Aluguel', merchant: 'Imobiliária Central', bank: 'Itaú', bankColor: '#F97316', range: [750, 800] },
    { desc: 'Conta de Luz', merchant: 'Enel Distribuição', bank: 'Bradesco', bankColor: '#EF4444', range: [100, 150] },
    { desc: 'Condomínio', merchant: 'Condomínio Edifício Vista', bank: 'Itaú', bankColor: '#F97316', range: [80, 120] },
  ],
  Saúde: [
    { desc: 'Farmácia São João', merchant: 'Farmácia São João', bank: 'Itaú', bankColor: '#F97316', range: [50, 110] },
    { desc: 'Consulta Médica', merchant: 'Clínica Saúde+', bank: 'Nubank', bankColor: '#8B5CF6', range: [150, 280] },
    { desc: 'Plano de Saúde', merchant: 'Hapvida', bank: 'Bradesco', bankColor: '#EF4444', range: [90, 130] },
  ],
  Lazer: [
    { desc: 'Netflix', merchant: 'Netflix International', bank: 'Bradesco', bankColor: '#EF4444', range: [50, 60] },
    { desc: 'Spotify', merchant: 'Spotify AB', bank: 'Nubank', bankColor: '#8B5CF6', range: [25, 35] },
    { desc: 'Cinema UCI', merchant: 'UCI Cinemas', bank: 'Nubank', bankColor: '#8B5CF6', range: [40, 90] },
    { desc: 'Barzinho', merchant: 'Boteco Vila', bank: 'Itaú', bankColor: '#F97316', range: [80, 160] },
  ],
  Outros: [
    { desc: 'Livraria', merchant: 'Livraria Cultura', bank: 'Itaú', bankColor: '#F97316', range: [60, 130] },
    { desc: 'Roupa', merchant: 'Renner', bank: 'Bradesco', bankColor: '#EF4444', range: [120, 240] },
    { desc: 'Taxa de Serviço', merchant: 'Banco Taxa', bank: 'Nubank', bankColor: '#8B5CF6', range: [40, 90] },
  ],
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  Alimentação: 'fa-basket-shopping',
  Transporte: 'fa-car',
  Moradia: 'fa-house',
  Saúde: 'fa-pills',
  Lazer: 'fa-film',
  Outros: 'fa-ellipsis',
};

function randInt(min: number, max: number, seed: number) {
  const x = Math.sin(seed) * 10000;
  return Math.round(((x - Math.floor(x)) * (max - min) + min));
}

function buildTransactionsForMonth(slug: MonthSlug): Transaction[] {
  const m = MONTHS.find((x) => x.slug === slug)!;
  const target = SPENT_BY_MONTH[slug];
  const perCategoryBudget: Record<string, number> = {
    Alimentação: target.budget_food,
    Transporte: target.budget_transport,
    Moradia: target.budget_house,
    Saúde: target.budget_health,
    Lazer: target.budget_entertainment,
    Outros: target.budget_other,
  };

  const txs: Transaction[] = [];
  const baseSeed = m.monthIndex * 131 + 7;
  let globalIdx = 0;

  Object.entries(perCategoryBudget).forEach(([catName, total]) => {
    const merchants = MERCHANT_POOL[catName];
    let remaining = total;
    const txCount = catName === 'Moradia' ? 3 : 4 + randInt(0, 3, baseSeed + total);
    for (let i = 0; i < txCount; i++) {
      const pool = merchants[i % merchants.length];
      const isLast = i === txCount - 1;
      const seed = baseSeed * 100 + globalIdx++;
      const raw = isLast ? remaining : Math.min(remaining, randInt(pool.range[0], pool.range[1], seed));
      const amount = +Math.max(1, raw).toFixed(2);
      const day = 1 + (seed % 27);
      const hour = 8 + (seed % 12);
      const minute = (seed * 3) % 60;
      const date = new Date(m.year, m.monthIndex, day, hour, minute);
      const isJunCurrent = m.current && day === 26;
      const formattedDate = isJunCurrent
        ? hour >= 12 ? 'Hoje, 05:30' : 'Ontem, 08:00'
        : `${day.toString().padStart(2, '0')} ${m.label}, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      txs.push({
        id: `tx_${slug}_${globalIdx}`,
        description: pool.desc,
        merchant: pool.merchant,
        category: catName,
        categoryIcon: CATEGORY_ICON_MAP[catName] ?? 'fa-tag',
        bank: pool.bank,
        bankColor: pool.bankColor,
        amount: -amount,
        type: 'debit',
        formattedAmount: `- R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        date,
        formattedDate,
      });
      remaining = +(remaining - amount).toFixed(2);
      if (remaining <= 0.01) break;
    }
  });

  txs.sort((a, b) => b.date.getTime() - a.date.getTime());
  return txs;
}

export const TRANSACTIONS_BY_MONTH: Record<MonthSlug, Transaction[]> = Object.fromEntries(
  MONTH_SLUGS.map((slug) => [slug, buildTransactionsForMonth(slug)])
) as Record<MonthSlug, Transaction[]>;

TRANSACTIONS_BY_MONTH.jun = [
  ...mockTransactions.filter((t) => t.amount < 0),
  ...TRANSACTIONS_BY_MONTH.jun.filter((t) => t.amount < 0).slice(0, 3),
].sort((a, b) => b.date.getTime() - a.date.getTime());
