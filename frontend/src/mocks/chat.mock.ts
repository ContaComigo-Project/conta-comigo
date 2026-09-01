import { mockBudgetCategories, type BudgetCategory, type BudgetStatus } from './budget.mock';
import { mockTransactions } from './transactions.mock';
import { mockMetrics } from './metrics.mock';

export type ChatRole = 'user' | 'assistant';
export type ChatCardType = 'budget_status' | 'purchase_plan' | 'insight_summary' | 'category_detail';

export interface ChatAttachment {
  type: ChatCardType;
  data: unknown;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  quickActions?: { label: string; value: string }[];
}

export interface BudgetStatusData {
  totalSpent: number;
  totalLimit: number;
  verde: number;
  amarelo: number;
  vermelho: number;
  topAlert: { name: string; spent: number; limit: number }[];
}

export interface PurchaseOption {
  id: string;
  title: string;
  monthlyCost: number;
  months: number;
  totalCost: number;
  impact: string;
  status: BudgetStatus;
}

export interface PurchasePlanData {
  item: string;
  targetValue: number;
  options: PurchaseOption[];
}

export const CHAT_SUGGESTION_CHIPS = [
  'Como está meu orçamento?',
  'Mostrar categorias',
  'Planejar compra R$ 3.500',
] as const;

export const CHAT_DEFAULT_QUICK_ACTIONS = [
  { label: 'Status do orçamento', value: 'Como está meu orçamento esse mês?' },
  { label: 'Planejar compra', value: 'Quero planejar uma compra de R$ 3.000.' },
] as const;

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getBudgetAggregates = () => {
  const statusCounts = mockBudgetCategories.reduce(
    (acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }),
    { verde: 0, amarelo: 0, vermelho: 0 }
  );
  const totalSpent = +mockBudgetCategories.reduce((s, c) => s + c.spent, 0).toFixed(2);
  const totalLimit = mockBudgetCategories.reduce((s, c) => s + c.limit, 0);
  const topAlert: BudgetCategory[] = [...mockBudgetCategories]
    .filter((c) => c.status === 'vermelho' || c.status === 'amarelo')
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2);
  if (topAlert.length === 0) {
    topAlert.push(...[...mockBudgetCategories].sort((a, b) => b.percentage - a.percentage).slice(0, 2));
  }
  return {
    statusCounts,
    totalSpent,
    totalLimit,
    topAlert: topAlert.map((c) => ({ name: c.name, spent: c.spent, limit: c.limit })),
  };
};

const getBudgetMonthLabel = () => {
  const today = new Date();
  return today.toLocaleDateString('pt-BR', { month: 'long' })
    .replace(/^./, (c) => c.toUpperCase());
};

const getFixedExpensesPct = () => {
  const housing = mockBudgetCategories.find((c) => c.id === 'budget_house');
  const food = mockBudgetCategories.find((c) => c.id === 'budget_food');
  const totalIncome = mockTransactions.find((t) => t.category === 'Receita')?.amount ?? 0;
  const fixed = (housing?.spent ?? 0) + (food?.spent ?? 0) * 0.6;
  const pct = totalIncome > 0 ? (fixed / totalIncome) * 100 : 0;
  return { pct: +pct.toFixed(1), income: totalIncome };
};

const buildPurchasePlan = (rawTarget: number, itemLabel: string) => {
  const target = Math.max(1, rawTarget);
  const bal = mockMetrics.find((m) => m.id === 'metric_balance')?.value ?? 0;
  const immediateImpact = target / Math.max(1, bal);
  const inCashStatus: BudgetStatus = immediateImpact > 0.25 ? 'vermelho' : immediateImpact > 0.12 ? 'amarelo' : 'verde';
  const options: PurchaseOption[] = [
    {
      id: 'sim1',
      title: 'À vista (débito)',
      monthlyCost: target,
      months: 1,
      totalCost: target,
      impact: 'Alto impacto imediato mas sem juros',
      status: inCashStatus,
    },
    {
      id: 'sim2',
      title: 'Parcelado 12x sem juros',
      monthlyCost: +(target / 12).toFixed(2),
      months: 12,
      totalCost: target,
      impact: 'Baixo impacto mensal',
      status: 'verde',
    },
    {
      id: 'sim3',
      title: 'Poupar 4 meses',
      monthlyCost: +(target / 4).toFixed(2),
      months: 4,
      totalCost: target,
      impact: 'Não compromete emergência',
      status: 'verde',
    },
  ];
  const data: PurchasePlanData = { item: itemLabel, targetValue: target, options };
  const recommended = options[1];
  const monthlyIncome = mockTransactions.find((t) => t.category === 'Receita')?.amount ?? 8500;
  const pctIncome = +((recommended.monthlyCost / Math.max(1, monthlyIncome)) * 100).toFixed(1);
  const content =
    `Simulei 3 cenários. A opção com parcelamento de 12x sem juros mantém seu fluxo de caixa saudável, pois a parcela representa apenas ${pctIncome}% de sua receita. A opção à vista tem alto impacto mas sem custos extras. Lembre-se: esta é uma simulação, não aconselhamento financeiro. Deseja detalhar alguma opção?`;
  return { content, attachments: [{ type: 'purchase_plan' as const, data }] };
};

const parsePurchaseValue = (userText: string): number | null => {
  const m = userText.match(/(?:r\$?\s*)?([\d.]+(?:,\d{1,2})?)/i);
  if (!m) return null;
  const clean = m[1].replace(/\./g, '').replace(',', '.');
  const v = parseFloat(clean);
  return Number.isFinite(v) && v > 0 ? v : null;
};

const purchaseItemFromText = (userText: string): string => {
  if (/tv|televisão|televisao/i.test(userText)) return 'TV 55" 4K';
  if (/celular|smartphone|iphone/i.test(userText)) return 'Smartphone';
  if (/notebook|laptop|pc|computador/i.test(userText)) return 'Notebook';
  if (/moto|bicicleta|bike/i.test(userText)) return 'Bicicleta';
  if (/viagem|ferias|férias/i.test(userText)) return 'Viagem';
  return 'Bem de consumo';
};

export function generateMockReply(userText: string): Omit<ChatMessage, 'id' | 'timestamp'> {
  const lower = userText.toLowerCase();

  if (lower.includes('categoria') || lower.includes('status')) {
    const agg = getBudgetAggregates();
    const worst = [...mockBudgetCategories].sort((a, b) => b.percentage - a.percentage)[0];
    const topRising = [...mockBudgetCategories].sort((a, b) => b.trend - a.trend)[0];
    const content =
      `Atualmente você tem ${agg.statusCounts.verde} categorias no verde, ${agg.statusCounts.amarelo} em atenção e ${agg.statusCounts.vermelho} excedidas. ${agg.topAlert.map((a) => a.name).join(' e ')} pedem cautela este mês. ${topRising.name} subiu ${topRising.trend >= 0 ? '+' : ''}${topRising.trend}% vs últimos meses. Deseja ajustar algum limite?`;
    const data: BudgetStatusData = {
      totalSpent: agg.totalSpent,
      totalLimit: agg.totalLimit,
      verde: agg.statusCounts.verde,
      amarelo: agg.statusCounts.amarelo,
      vermelho: agg.statusCounts.vermelho,
      topAlert: agg.topAlert,
    };
    void worst;
    return {
      role: 'assistant',
      content,
      attachments: [{ type: 'budget_status', data }],
    };
  }

  if (lower.includes('comprar') || lower.includes('parcel') || lower.includes('r$') || /\d{2,}/.test(lower)) {
    const v = parsePurchaseValue(userText);
    const label = purchaseItemFromText(userText);
    const plan = buildPurchasePlan(v ?? 3500, label);
    return {
      role: 'assistant',
      content: plan.content,
      attachments: plan.attachments,
    };
  }

  if (lower.includes('orçamento') || lower.includes('gasto') || lower.includes('orcamento')) {
    const agg = getBudgetAggregates();
    const pct = +((agg.totalSpent / agg.totalLimit) * 100).toFixed(0);
    const { pct: fixedPct, income } = getFixedExpensesPct();
    const leisure = mockBudgetCategories.find((c) => c.id === 'budget_entertainment');
    const leisureMargin = leisure ? +(100 - leisure.percentage).toFixed(0) : 0;
    const monthLabel = getBudgetMonthLabel();
    const content =
      `Em ${monthLabel} você gastou R$ ${formatBRL(agg.totalSpent)} de R$ ${formatBRL(agg.totalLimit)} disponíveis (${pct}%). Receita de R$ ${formatBRL(Math.max(0, income))}. Gastos fixos representam ${fixedPct}% da receita. Para manter o score saudável, sugiro revisar o limite de Lazer (atualmente ${leisureMargin}% de margem livre) e redistribuir para ${agg.topAlert[0]?.name ?? 'Alimentação'}.`;
    const data: BudgetStatusData = {
      totalSpent: agg.totalSpent,
      totalLimit: agg.totalLimit,
      verde: agg.statusCounts.verde,
      amarelo: agg.statusCounts.amarelo,
      vermelho: agg.statusCounts.vermelho,
      topAlert: agg.topAlert,
    };
    return {
      role: 'assistant',
      content,
      attachments: [{ type: 'budget_status', data }],
    };
  }

  return {
    role: 'assistant',
    content:
      'Entendi sua pergunta. Com base nos seus dados sincronizados via Open Finance, posso: (1) mostrar o status do orçamento por categoria, (2) planejar uma compra com múltiplas opções de pagamento, (3) resumir seus gastos do mês ou (4) analisar tendências dos últimos 3 meses. Qual caminho prefere?',
    quickActions: [...CHAT_DEFAULT_QUICK_ACTIONS],
  };
}

export const mockChatMessages: ChatMessage[] = (() => {
  const agg = getBudgetAggregates();
  const pct = +((agg.totalSpent / agg.totalLimit) * 100).toFixed(0);
  const plan = buildPurchasePlan(3500, 'TV 55" 4K');
  const msgs: ChatMessage[] = [
    {
      id: 'chat_001',
      role: 'assistant',
      content:
        'Olá Raul! Sou o seu consultor financeiro. Posso te ajudar a analisar seus gastos, planejar compras e acompanhar seu orçamento mensal. Por onde vamos começar?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      quickActions: [
        { label: 'Como está meu orçamento?', value: 'Como está meu orçamento esse mês?' },
        { label: 'Quero comprar uma TV', value: 'Quero comprar uma TV de R$ 3.500, qual a melhor forma?' },
        { label: 'Minhas categorias', value: 'Me mostre o status das minhas categorias de gasto.' },
      ],
    },
    {
      id: 'chat_002',
      role: 'user',
      content: 'Como está meu orçamento esse mês?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.8),
    },
    {
      id: 'chat_003',
      role: 'assistant',
      content:
        `Seu orçamento de ${getBudgetMonthLabel()} está equilibrado. Gastei R$ ${formatBRL(agg.totalSpent)} de um limite total de R$ ${formatBRL(agg.totalLimit)} (${pct}%). Atenção a ${agg.statusCounts.vermelho + agg.statusCounts.amarelo} pontos: ${agg.topAlert.map((a) => a.name).join(' e ')}. Lazer tem ${+(100 - (mockBudgetCategories.find((c) => c.id === 'budget_entertainment')?.percentage ?? 0)).toFixed(0)}% de margem livre. Veja o resumo:`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.78),
      attachments: [
        {
          type: 'budget_status',
          data: {
            totalSpent: agg.totalSpent,
            totalLimit: agg.totalLimit,
            verde: agg.statusCounts.verde,
            amarelo: agg.statusCounts.amarelo,
            vermelho: agg.statusCounts.vermelho,
            topAlert: agg.topAlert,
          },
        },
      ],
    },
    {
      id: 'chat_004',
      role: 'user',
      content: 'Quero comprar uma TV de R$ 3.500, qual a melhor forma?',
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
    },
    {
      id: 'chat_005',
      role: 'assistant',
      content: plan.content,
      timestamp: new Date(Date.now() - 1000 * 60 * 49),
      attachments: plan.attachments,
      quickActions: [
        { label: 'Detalhar 12x', value: 'Mostre-me mais detalhes da opção 12x sem juros.' },
        { label: 'Ver categorias', value: 'Quais categorias são afetadas?' },
      ],
    },
  ];
  return msgs;
})();
