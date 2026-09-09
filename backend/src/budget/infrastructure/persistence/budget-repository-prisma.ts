import { PrismaPg } from '@prisma/adapter-pg';
import type { LimiteMensal } from '../../domain/model/monthly-limit';
import type { BudgetAlert, FaixaDeAlerta } from '../../domain/model/budget-alert';
import type { BudgetRepository } from '../../domain/port/driven/budget-repository';
import { PrismaClient } from '../../../transactions/infrastructure/persistence/gerado/client';

// Adaptador real (ADR-002). O titular entra na CONSULTA, nunca em um filtro
// posterior em memoria (RN-015).
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class BudgetRepositoryPrisma implements BudgetRepository {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async definir(limite: LimiteMensal): Promise<void> {
    // Chave composta: definir de novo substitui, e nao duplica (RF-013).
    await this.prisma.monthlyBudget.upsert({
      where: {
        holderId_month_category: {
          holderId: limite.holderId,
          month: limite.month,
          category: limite.category,
        },
      },
      create: limite,
      update: { limitInCents: limite.limitInCents },
    });
  }

  async remover(holderId: string, month: string, category: string): Promise<boolean> {
    // Apaga a linha: ausencia e o que RN-002 chama de "sem limite". Gravar zero
    // seria outra promessa.
    const { count } = await this.prisma.monthlyBudget.deleteMany({ where: { holderId, month, category } });
    return count > 0;
  }

  async listarDoMes(holderId: string, month: string): Promise<readonly LimiteMensal[]> {
    const linhas = await this.prisma.monthlyBudget.findMany({
      where: { holderId, month },
      orderBy: { category: 'asc' },
    });
    return linhas.map((l) => ({
      holderId: l.holderId,
      month: l.month,
      category: l.category,
      limitInCents: l.limitInCents,
    }));
  }

  /** So para teste de integracao: limpa a tabela entre cenarios. */
  async limparTudo(): Promise<void> {
    await this.prisma.monthlyBudget.deleteMany();
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async listarAlertasDoMes(holderId: string, month: string): Promise<readonly BudgetAlert[]> {
    const linhas = await this.prisma.budgetAlert.findMany({ where: { holderId, month } });
    return linhas.map((l) => ({
      id: l.id,
      holderId: l.holderId,
      categoryId: l.categoryId,
      month: l.month,
      band: l.band as FaixaDeAlerta,
      createdAt: l.createdAt,
    }));
  }

  async registrarAlerta(alerta: BudgetAlert): Promise<void> {
    await this.prisma.budgetAlert.create({
      data: {
        id: alerta.id,
        holderId: alerta.holderId,
        categoryId: alerta.categoryId,
        month: alerta.month,
        band: alerta.band,
        createdAt: alerta.createdAt,
      },
    });
  }
}
