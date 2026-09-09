import type { HolderId } from './holder';
import type { Categoria, OrigemDaCategoria } from './category';

// Entidade de dominio. Sem decorator de ORM, validacao de transporte ou
// serializacao (ADR-001, regra adicional 1): o modelo de persistencia e outro.
export interface Transaction {
  readonly id: string;
  /** Dono do dado (RN-015). Sem ele nao ha barreira entre holderes. */
  readonly holderId: HolderId;
  /** Como veio do agregador. NUNCA e sobrescrita (RN-010). */
  readonly description: string;
  /**
   * Versao legivel derivada (HN-004, RF-010). `null` enquanto a limpeza nao
   * rodou; igual a `description` quando nada foi reconhecido.
   */
  readonly readableDescription: string | null;
  /** Categoria do catalogo, ou `null` para "nao classificado" (HN-005, RF-011). */
  readonly category: Categoria | null;
  /**
   * Quem classificou (RN-011). `manual` nunca e sobrescrita por sincronizacao,
   * regra ou modelo — so por outra correcao manual.
   */
  readonly categoryOrigin: OrigemDaCategoria | null;
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
