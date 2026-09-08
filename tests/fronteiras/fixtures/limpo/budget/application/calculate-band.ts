import { budgetBand } from '../domain/budget-band';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';

export async function calcularBand(repo: BudgetRepository, category: string) {
  return budgetBand(await repo.spentPercentage(category));
}
