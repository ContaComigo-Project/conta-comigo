/**
 * @file dashboard.mock.ts
 * @description Dados mockados para o Dashboard do ContaComigo.
 * Estruturado para espelhar o contrato de resposta da API NestJS futura.
 * Substitua pelos dados reais vindos do hook `useDashboard()` via React Query.
 */

// ─── Usuário ────────────────────────────────────────────────────────────────
export const mockUser = {
  id: 'usr_01hw8k2z3n4p5q6r7s8t9u0v',
  name: 'Raul Lize',
  firstName: 'Raul',
  email: 'raul@contacomigo.app',
  avatarInitials: 'RL',
  avatarColor: '#0a6d42',
  openFinanceStatus: 'synced' as 'synced' | 'syncing' | 'error',
  lastSyncAt: new Date(Date.now() - 1000 * 60 * 4), // 4 minutos atrás
};

// ─── Métricas Principais ─────────────────────────────────────────────────────
export interface Metric {
  id: string;
  label: string;
  value: number;
  formatted: string;
  trend: number; // percentual em relação ao mês anterior (positivo = crescimento)
  trendLabel: string;
  icon: 'wallet' | 'trending-down' | 'bar-chart';
  highlight?: boolean;
}

export const mockMetrics: Metric[] = [
  {
    id: 'metric_balance',
    label: 'Saldo Consolidado',
    value: 18_742.55,
    formatted: 'R$ 18.742,55',
    trend: +3.2,
    trendLabel: 'vs. mês anterior',
    icon: 'wallet',
    highlight: true,
  },
  {
    id: 'metric_expenses',
    label: 'Gastos do Mês',
    value: 4_318.90,
    formatted: 'R$ 4.318,90',
    trend: -5.1,
    trendLabel: 'vs. mês anterior',
    icon: 'trending-down',
  },
  {
    id: 'metric_investments',
    label: 'Total Investido',
    value: 32_100.00,
    formatted: 'R$ 32.100,00',
    trend: +8.7,
    trendLabel: 'rentabilidade YTD',
    icon: 'bar-chart',
  },
];

// ─── Insight de IA ──────────────────────────────────────────────────────────
export interface AIInsight {
  id: string;
  type: 'opportunity' | 'alert' | 'goal';
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  confidence: number; // 0–100
  generatedAt: Date;
}

export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight_001',
    type: 'opportunity',
    title: 'Oportunidade de rendimento identificada',
    body: 'Identifiquei R$ 450,00 parados na conta corrente do Nubank que poderiam render aproximadamente R$ 38,70/mês no CDB do Banco Inter com liquidez diária. Além disso, suas metas de economia estão 12% mais próximas este mês! 🎯',
    ctaLabel: 'Ver simulação',
    ctaRoute: '/dashboard/investimentos',
    confidence: 94,
    generatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'insight_002',
    type: 'alert',
    title: 'Padrão de gasto incomum',
    body: 'Seus gastos com alimentação aumentaram 28% em relação à média dos últimos 3 meses. Você gastou R$ 1.240,00 nesta categoria em junho. Deseja revisar seu orçamento?',
    ctaLabel: 'Analisar categoria',
    ctaRoute: '/dashboard/despesas',
    confidence: 89,
    generatedAt: new Date(Date.now() - 1000 * 60 * 90),
  },
];

// ─── Gráfico de Gastos por Categoria ────────────────────────────────────────
export interface SpendingCategory {
  id: string;
  name: string;
  value: number;
  percentage: number; // % do total de gastos do mês
  color: string;
  icon: string; // Font Awesome class
}

export const mockSpendingCategories: SpendingCategory[] = [
  { id: 'cat_food',    name: 'Alimentação',   value: 1240.00, percentage: 28.7, color: '#36b37e', icon: 'fa-utensils' },
  { id: 'cat_trans',  name: 'Transporte',    value:  820.50, percentage: 19.0, color: '#0a6d42', icon: 'fa-car' },
  { id: 'cat_house',  name: 'Moradia',       value:  950.00, percentage: 22.0, color: '#219b66', icon: 'fa-house' },
  { id: 'cat_health', name: 'Saúde',         value:  410.00, percentage:  9.5, color: '#001b42', icon: 'fa-heart-pulse' },
  { id: 'cat_entert', name: 'Lazer',         value:  310.40, percentage:  7.2, color: '#4ade80', icon: 'fa-gamepad' },
  { id: 'cat_other',  name: 'Outros',        value:  588.00, percentage: 13.6, color: '#cbd5e1', icon: 'fa-ellipsis' },
];

// ─── Transações Recentes ─────────────────────────────────────────────────────
export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  description: string;
  merchant?: string;
  category: string;
  categoryIcon: string; // Font Awesome class
  bank: string;
  bankColor: string;
  amount: number;
  type: TransactionType;
  formattedAmount: string;
  date: Date;
  formattedDate: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    description: 'Uber',
    merchant: 'Uber Brasil',
    category: 'Transporte',
    categoryIcon: 'fa-car',
    bank: 'Nubank',
    bankColor: '#8B5CF6',
    amount: -34.90,
    type: 'debit',
    formattedAmount: '- R$ 34,90',
    date: new Date(Date.now() - 1000 * 60 * 40),
    formattedDate: 'Hoje, 10:02',
  },
  {
    id: 'txn_002',
    description: 'Pão de Açúcar',
    merchant: 'Grupo Pão de Açúcar',
    category: 'Alimentação',
    categoryIcon: 'fa-basket-shopping',
    bank: 'Itaú',
    bankColor: '#F97316',
    amount: -218.50,
    type: 'debit',
    formattedAmount: '- R$ 218,50',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    formattedDate: 'Hoje, 05:30',
  },
  {
    id: 'txn_003',
    description: 'Salário Junho',
    merchant: 'Empresa XYZ LTDA',
    category: 'Receita',
    categoryIcon: 'fa-arrow-trend-up',
    bank: 'Nubank',
    bankColor: '#8B5CF6',
    amount: +8_500.00,
    type: 'credit',
    formattedAmount: '+ R$ 8.500,00',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    formattedDate: 'Ontem, 08:00',
  },
  {
    id: 'txn_004',
    description: 'Netflix',
    merchant: 'Netflix International',
    category: 'Lazer',
    categoryIcon: 'fa-film',
    bank: 'Bradesco',
    bankColor: '#EF4444',
    amount: -55.90,
    type: 'debit',
    formattedAmount: '- R$ 55,90',
    date: new Date(Date.now() - 1000 * 60 * 60 * 36),
    formattedDate: 'Ontem, 00:01',
  },
  {
    id: 'txn_005',
    description: 'Farmácia São João',
    merchant: 'Farmácia São João',
    category: 'Saúde',
    categoryIcon: 'fa-pills',
    bank: 'Itaú',
    bankColor: '#F97316',
    amount: -87.40,
    type: 'debit',
    formattedAmount: '- R$ 87,40',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    formattedDate: '13 Jun, 18:45',
  },
  {
    id: 'txn_006',
    description: 'Rendimento CDB',
    merchant: 'Banco Inter',
    category: 'Investimentos',
    categoryIcon: 'fa-chart-line',
    bank: 'Banco Inter',
    bankColor: '#F97316',
    amount: +38.70,
    type: 'credit',
    formattedAmount: '+ R$ 38,70',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    formattedDate: '12 Jun, 08:00',
  },
];

// ─── Bancos Conectados ───────────────────────────────────────────────────────
export interface ConnectedBank {
  id: string;
  name: string;
  color: string;
  initials: string;
  balance: number;
  formattedBalance: string;
  status: 'active' | 'syncing' | 'error';
  lastSync: string;
}

export const mockConnectedBanks: ConnectedBank[] = [
  { id: 'bank_nubank',   name: 'Nubank',      color: '#8B5CF6', initials: 'NU', balance: 2_418.32,  formattedBalance: 'R$ 2.418,32',  status: 'active',  lastSync: 'Agora mesmo' },
  { id: 'bank_itau',    name: 'Itaú',        color: '#F97316', initials: 'IT', balance: 10_842.13, formattedBalance: 'R$ 10.842,13', status: 'active',  lastSync: '3 min atrás' },
  { id: 'bank_bradesco',name: 'Bradesco',    color: '#EF4444', initials: 'BB', balance: 5_482.10,  formattedBalance: 'R$ 5.482,10',  status: 'syncing', lastSync: 'Sincronizando...' },
];
