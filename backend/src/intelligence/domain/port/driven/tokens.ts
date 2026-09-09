// Identity das portas para injecao por token (ADR-001, regra adicional 3).
export const TOKENS_INTELLIGENCE = {
  AiAdvisor: Symbol.for('intelligence/AiAdvisor'),
  AdviceCache: Symbol.for('intelligence/AdviceCache'),
  UsageCounter: Symbol.for('intelligence/UsageCounter'),
  Clock: Symbol.for('intelligence/Clock'),
  GuardLog: Symbol.for('intelligence/GuardLog'),
} as const;
