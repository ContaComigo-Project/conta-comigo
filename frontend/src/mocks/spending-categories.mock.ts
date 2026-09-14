export interface SpendingCategory {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
}

export const mockSpendingCategories: SpendingCategory[] = [
  { id: 'cat_food',    name: 'Alimentação', value: 1240.00, percentage: 28.7, color: '#36b37e', icon: 'fa-utensils' },
  { id: 'cat_trans',   name: 'Transporte',  value:  820.50, percentage: 19.0, color: '#0a6d42', icon: 'fa-car' },
  { id: 'cat_house',   name: 'Moradia',     value:  950.00, percentage: 22.0, color: '#219b66', icon: 'fa-house' },
  { id: 'cat_health',  name: 'Saúde',       value:  410.00, percentage:  9.5, color: '#001b42', icon: 'fa-heart-pulse' },
  { id: 'cat_entert',  name: 'Lazer',       value:  310.40, percentage:  7.2, color: '#4ade80', icon: 'fa-gamepad' },
  { id: 'cat_other',   name: 'Outros',      value:  588.00, percentage: 13.6, color: '#cbd5e1', icon: 'fa-ellipsis' },
];
