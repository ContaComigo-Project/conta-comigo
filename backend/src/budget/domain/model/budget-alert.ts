// Aviso de cruzamento de faixa (RF-015 / RN-005): no máximo UM por faixa, por
// categoria, por mês. Persistido — "não repetir" é regra, não bom comportamento.
export type FaixaDeAlerta = 'amarela' | 'vermelha';

export interface BudgetAlert {
  readonly id: string;
  readonly holderId: string;
  readonly categoryId: string;
  /** Mês no formato AAAA-MM. */
  readonly month: string;
  readonly band: FaixaDeAlerta;
  readonly createdAt: Date;
}