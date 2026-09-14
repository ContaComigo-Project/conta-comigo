import type { Faixa } from '../../budget-band';

export interface MesDoHistorico {
  readonly month: string;
  readonly categorias: readonly { category: string; limitInCents: number | null; spentInCents: number; band: Faixa }[];
}

/** RN-023: calculado dos dados, nunca gerado pela IA. */
export interface ProblemaRecorrente {
  readonly category: string;
  /** Quantos meses fechados a categoria ficou vermelha (estourou). */
  readonly vezesEmVermelho: number;
  /** Soma dos excessos (gasto-limite) nos meses vermelhos — desempate (RN-023). */
  readonly excessoTotalEmCentavos: number;
}

export interface HistoricoDoOrcamento {
  readonly meses: readonly MesDoHistorico[];
  /** Os três problemas mais recorrentes (RF-017). */
  readonly problemas: readonly ProblemaRecorrente[];
}

export interface GetBudgetHistory {
  executar(holderId: string): Promise<HistoricoDoOrcamento>;
}