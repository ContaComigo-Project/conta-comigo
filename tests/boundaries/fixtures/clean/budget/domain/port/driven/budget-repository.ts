export interface BudgetRepository {
  spentPercentage(category: string): Promise<number>;
}
