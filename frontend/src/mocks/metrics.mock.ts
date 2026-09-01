export interface Metric {
  id: string;
  label: string;
  value: number;
  formatted: string;
  trend: number;
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
