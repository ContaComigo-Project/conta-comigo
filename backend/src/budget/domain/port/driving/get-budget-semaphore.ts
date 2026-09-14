import type { Faixa } from '../../budget-band';

export interface CategoriaDoSemaforo {
  readonly category: string;
  readonly limitInCents: number | null;
  readonly spentInCents: number;
  /** gasto/limite*100; 0 quando sem limite (RN-002). */
  readonly percentage: number;
  readonly band: Faixa;
}

export interface AlertaDoSemaforo {
  readonly category: string;
  readonly band: 'amarela' | 'vermelha';
  readonly month: string;
}

export interface SemaforoDoOrcamento {
  readonly month: string;
  readonly categorias: readonly CategoriaDoSemaforo[];
  /** Inclui os alertas já emitidos e os emitidos nesta avaliação (RN-005). */
  readonly alertas: readonly AlertaDoSemaforo[];
}

export interface GetBudgetSemaphore {
  executar(holderId: string, month: string): Promise<SemaforoDoOrcamento>;
}