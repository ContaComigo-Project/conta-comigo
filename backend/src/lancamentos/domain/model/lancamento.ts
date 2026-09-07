// Entidade de dominio. Sem decorator de ORM, validacao de transporte ou
// serializacao (ADR-001, regra adicional 1): o modelo de persistencia e outro.
export interface Lancamento {
  readonly id: string;
  readonly descricao: string;
  /** Valor em centavos: inteiro evita erro de ponto flutuante em soma. */
  readonly valorEmCentavos: number;
  /** Data de competencia — a que define o mes de referencia (RN-003). */
  readonly dataDeCompetencia: Date;
}
