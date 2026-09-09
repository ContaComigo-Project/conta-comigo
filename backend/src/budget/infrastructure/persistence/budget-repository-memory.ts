import type { LimiteMensal } from '../../domain/model/monthly-limit';
import type { BudgetAlert } from '../../domain/model/budget-alert';
import type { BudgetRepository } from '../../domain/port/driven/budget-repository';

// Adaptador falso (ADR-001). A chave e a mesma do banco: (titular, mes,
// categoria) — se divergisse, o teste unitario passaria e a integracao quebraria.
export class BudgetRepositoryEmMemoria implements BudgetRepository {
  private readonly limites = new Map<string, LimiteMensal>();

  private chave(holderId: string, month: string, category: string): string {
    return `${holderId}:${month}:${category}`;
  }

  async definir(limite: LimiteMensal): Promise<void> {
    this.limites.set(this.chave(limite.holderId, limite.month, limite.category), limite);
  }

  async remover(holderId: string, month: string, category: string): Promise<boolean> {
    return this.limites.delete(this.chave(holderId, month, category));
  }

  async listarDoMes(holderId: string, month: string): Promise<readonly LimiteMensal[]> {
    return [...this.limites.values()].filter((l) => l.holderId === holderId && l.month === month);
  }

  private readonly alertas: BudgetAlert[] = [];

  async listarAlertasDoMes(holderId: string, month: string): Promise<readonly BudgetAlert[]> {
    return this.alertas.filter((a) => a.holderId === holderId && a.month === month);
  }

  async registrarAlerta(alerta: BudgetAlert): Promise<void> {
    this.alertas.push(alerta);
  }
}
