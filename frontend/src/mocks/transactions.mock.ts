export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  description: string;
  merchant?: string;
  category: string;
  categoryIcon: string;
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
