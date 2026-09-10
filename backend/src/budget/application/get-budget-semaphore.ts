import { randomUUID } from 'node:crypto';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import { mesValido } from '../domain/model/monthly-limit';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import type { CategoriaDoSemaforo, GetBudgetSemaphore, SemaforoDoOrcamento } from '../domain/port/driving/get-budget-semaphore';
import { categoriasDoMes } from './por-categoria-do-mes';

// RF-014 / RN-001 / RN-002: the budget semaphore per category for a month.
// The spend comes from the persisted transactions (HN-003) grouped by category
// in the reference month (RN-003) — shared helper, so semaphore, history and
// diagnosis never diverge. RN-005: crossing a band emits an alert AT MOST once
// per band per category per month — persisted, so it cannot repeat.
export class GetBudgetSemaphoreUseCase implements GetBudgetSemaphore {
  constructor(
    private readonly repo: BudgetRepository,
    private readonly transactions: RepositorioDeTransactions,
  ) {}

  async executar(holderId: string, month: string): Promise<SemaforoDoOrcamento> {
    if (!mesValido(month)) throw new Error('Mes invalido (esperado AAAA-MM).');

    const limites = await this.repo.listarDoMes(holderId, month);
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);
    const base = await categoriasDoMes(limites, transacoes, month);

    const categorias: CategoriaDoSemaforo[] = base.map((c) => ({
      category: c.category,
      limitInCents: c.limitInCents,
      spentInCents: c.spentInCents,
      percentage: c.limitInCents && c.limitInCents > 0 ? (c.spentInCents * 100) / c.limitInCents : 0,
      band: c.band,
    }));

    // RN-005: emite o aviso no máximo uma vez por faixa por categoria por mês.
    // Se o gasto pula direto para a vermelha, cruzou a amarela também.
    const emitidos = await this.repo.listarAlertasDoMes(holderId, month);
    const alertas = emitidos.map((a) => ({ category: a.categoryId, band: a.band, month }));
    for (const c of categorias) {
      const faixasASinalizar: Array<'amarela' | 'vermelha'> =
        c.band === 'vermelha' ? ['amarela', 'vermelha'] : c.band === 'amarela' ? ['amarela'] : [];
      for (const banda of faixasASinalizar) {
        if (alertas.some((a) => a.category === c.category && a.band === banda)) continue;
        await this.repo.registrarAlerta({
          id: randomUUID(),
          holderId,
          categoryId: c.category,
          month,
          band: banda,
          createdAt: new Date(),
        });
        alertas.push({ category: c.category, band: banda, month });
      }
    }

    return { month, categorias, alertas };
  }
}