// RN-001 — o gasto da categoria no mes, dividido pelo limite, determina a faixa:
// verde ate 70% inclusive, amarela acima de 70% e ate 90% inclusive, vermelha
// acima de 90%. RN-002 — sem limite definido nao ha faixa: "sem-limite", nunca
// verde. A comparacao e sobre o valor exato: arredondar antes da faixa criaria
// fronteira ambigua (70,04% viraria verde) — RN-025 foi descartada por isso.
export type Faixa = 'verde' | 'amarela' | 'vermelha' | 'sem-limite';

export function faixaDoSemaforo(gastoEmCentavos: number, limiteEmCentavos: number | null): Faixa {
  // RN-002: sem limite (ou limite zero, que nao define proporcao) nao ha faixa.
  if (limiteEmCentavos === null || limiteEmCentavos <= 0) return 'sem-limite';

  // Comparacao em inteiros (gasto * 100 vs limite * percentual): sem ponto
  // flutuante, sem arredondamento intermediario (RN-006).
  const gastoVezesCem = gastoEmCentavos * 100;
  if (gastoVezesCem <= limiteEmCentavos * 70) return 'verde';
  if (gastoVezesCem <= limiteEmCentavos * 90) return 'amarela';
  return 'vermelha';
}
