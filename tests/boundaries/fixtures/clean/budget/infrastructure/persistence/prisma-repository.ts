// Unico lugar onde @prisma/client pode aparecer (ADR-002, regra 2).
import { PrismaClient } from '@prisma/client';
import type { BudgetRepository } from '../../domain/port/driven/budget-repository';

export class RepositorioPrisma implements BudgetRepository {
  private readonly cliente = new PrismaClient();
  async spentPercentage(): Promise<number> {
    void this.cliente;
    return 0;
  }
}
