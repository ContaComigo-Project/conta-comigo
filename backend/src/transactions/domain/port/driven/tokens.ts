// Identity das portas para injecao por token (ADR-001, regra adicional 3).
// Simbolos sao TypeScript puro: o dominio nao conhece o framework que os usa.
export const TOKENS = {
  RepositorioDeTransactions: Symbol.for('transactions/RepositorioDeTransactions'),
  ExternalAccountRepository: Symbol.for('transactions/ExternalAccountRepository'),
  Clock: Symbol.for('transactions/Clock'),
  GetMonthSummary: Symbol.for('transactions/GetMonthSummary'),
  ListarTransactions: Symbol.for('transactions/ListarTransactions'),
  GetConsolidatedSummary: Symbol.for('transactions/GetConsolidatedSummary'),
  Identity: Symbol.for('transactions/Identity'),
  CorrectCategory: Symbol.for('transactions/CorrectCategory'),
} as const;
