// Identity das portas para injecao por token (ADR-001, regra adicional 3).
export const TOKENS_OBSERVABILITY = {
  LogSink: Symbol.for('observability/LogSink'),
  Clock: Symbol.for('observability/Clock'),
} as const;
