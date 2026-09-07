// Identidade das portas para injecao por token (ADR-001, regra adicional 3).
// Simbolos sao TypeScript puro: o dominio nao conhece o framework que os usa.
export const TOKENS = {
  RepositorioDeLancamentos: Symbol.for('lancamentos/RepositorioDeLancamentos'),
  Relogio: Symbol.for('lancamentos/Relogio'),
  ConsultarResumoDoMes: Symbol.for('lancamentos/ConsultarResumoDoMes'),
} as const;
