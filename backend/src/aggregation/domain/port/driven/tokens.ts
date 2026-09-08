// Identity das portas do contexto `aggregation` (ADR-001, regra adicional 3).
export const TOKENS_AGGREGATION = {
  OpenFinanceAggregator: Symbol.for('aggregation/OpenFinanceAggregator'),
} as const;
