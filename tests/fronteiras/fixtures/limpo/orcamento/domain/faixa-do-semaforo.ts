import type { Faixa } from './model/faixa';

export function faixaDoSemaforo(percentual: number): Faixa {
  if (percentual <= 70) return 'verde';
  if (percentual <= 90) return 'amarela';
  return 'vermelha';
}
