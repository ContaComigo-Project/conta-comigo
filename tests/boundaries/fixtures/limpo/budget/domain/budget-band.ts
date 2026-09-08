import type { Band } from './model/band';

export function budgetBand(percentual: number): Band {
  if (percentual <= 70) return 'verde';
  if (percentual <= 90) return 'amarela';
  return 'vermelha';
}
