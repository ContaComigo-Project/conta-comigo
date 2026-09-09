import type { LimiteMensal } from '../../model/monthly-limit';

// Porta de saida (ADR-001). Nao existe "listar tudo": o titular entra em toda
// consulta (RN-015).
export interface BudgetRepository {
  /** Grava ou SUBSTITUI o limite de (titular, mes, categoria). */
  definir(limite: LimiteMensal): Promise<void>;

  /**
   * Apaga a linha. Ausencia e diferente de zero: sem linha, `faixaDoSemaforo`
   * devolve "sem-limite" (RN-002).
   */
  remover(holderId: string, month: string, category: string): Promise<boolean>;

  listarDoMes(holderId: string, month: string): Promise<readonly LimiteMensal[]>;
}
