// Identity das portas para injecao por token (ADR-001, regra adicional 3).
export const TOKENS_BUDGET = {
  BudgetRepository: Symbol.for('budget/BudgetRepository'),
  SetMonthlyLimit: Symbol.for('budget/SetMonthlyLimit'),
  RemoveMonthlyLimit: Symbol.for('budget/RemoveMonthlyLimit'),
  ListMonthlyLimits: Symbol.for('budget/ListMonthlyLimits'),
  GetBudgetSemaphore: Symbol.for('budget/GetBudgetSemaphore'),
  GetBudgetHistory: Symbol.for('budget/GetBudgetHistory'),
  GetDiagnosis: Symbol.for('budget/GetDiagnosis'),
  SimularPlanoDeCompra: Symbol.for('budget/SimularPlanoDeCompra'),
  ExportarRelatorioPDF: Symbol.for('budget/ExportarRelatorioPDF'),
} as const;
