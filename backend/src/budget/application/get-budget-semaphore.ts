import { randomUUID } from 'node:crypto';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import { mesDeReferencia } from '../../transactions/domain/reference-month';
import { faixaDoSemaforo } from '../domain/budget-band';
import { mesValido } from '../domain/model/monthly-limit';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import type { CategoriaDoSemaforo, GetBudgetSemaphore, SemaforoDoOrcamento } from '../domain/port/driving/get-budget-semaphore';

// RF-014 / RN-001 / RN-002: the budget semaphore per category for a month.
// The spend comes from the persisted transactions (HN-003) grouped by category
// in the reference month (RN-003). RN-005: crossing a band emits an alert AT
// MOST once per band per category per month — persisted, so it cannot repeat.
export class GetBudgetSemaphoreUseCase implements GetBudgetSemaphore {
  constructor(
    private readonly repo: BudgetRepository,
    private readonly transactions: RepositorioDeTransactions,
  ) {}

  async executar(holderId: string, month: string): Promise<SemaforoDoOrcamento> {
    if (!mesValido(month)) throw new Error('Mes invalido (esperado AAAA-MM).');

    const limites = await this.repo.listarDoMes(holderId, month);

    // Gasto por categoria no mês de referência (RN-003), fuso de São Paulo.
    const gastos = new Map<string, number>();
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);
    for (const t of transacoes) {
      if (!t.category) continue; // "não classificado" não entra no semáforo
      const m = mesDeReferencia(t.dueDate);
      if (`${m.ano}-${String(m.mes).padStart(2, '0')}` !== month) continue;
      gastos.set(t.category, (gastos.get(t.category) ?? 0) + t.amountInCents);
    }

    const categorias: CategoriaDoSemaforo[] = limites.map((l) => {
      const spent = gastos.get(l.category) ?? 0;
      const band = faixaDoSemaforo(spent, l.limitInCents);
      const percentage = l.limitInCents > 0 ? (spent * 100) / l.limitInCents : 0;
      return { category: l.category, limitInCents: l.limitInCents, spentInCents: spent, percentage, band };
    });

    // Categorias gastas SEM limite: RN-002 — "sem-limite", nunca verde.
    for (const [cat, spent] of gastos) {
      if (!limites.some((l) => l.category === cat)) {
        categorias.push({ category: cat, limitInCents: null, spentInCents: spent, percentage: 0, band: 'sem-limite' });
      }
    }

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