import type { HolderId } from './holder';

// Entidade de dominio. Sem decorator de ORM, validacao de transporte ou
// serializacao (ADR-001, regra adicional 1): o modelo de persistencia e outro.
export interface Transaction {
  readonly id: string;
  /** Dono do dado (RN-015). Sem ele nao ha barreira entre holderes. */
  readonly holderId: HolderId;
  readonly description: string;
  /** Valor em centavos: inteiro evita error de ponto flutuante em soma. */
  readonly amountInCents: number;
  /** Data de competencia — a que define o mes de referencia (RN-003). */
  readonly dueDate: Date;
  /**
   * Identificador externo do agregador (RN-008): mesma instituicao, mesmo
   * identificador e mesma data => mesmo lancamento, nao duplica.
   */
  readonly externalId: string | null;
}
