import { PrismaPg } from '@prisma/adapter-pg';
import type { Transaction } from '../../domain/model/transaction';
import type { HolderId } from '../../domain/model/holder';
import type { RepositorioDeTransactions } from '../../domain/port/driven/transaction-repository';
import { PrismaClient, type Transaction as LinhaDeTransaction } from './gerado/client';

// Adaptador real de persistencia (ADR-002). Unico lugar que conhece o Prisma:
// o cliente gerado vive em ./gerado, dentro de persistence/, e nenhum tipo dele
// sai deste arquivo — a traducao para a entidade acontece aqui.
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class RepositorioDeTransactionsPrisma implements RepositorioDeTransactions {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async salvar(transaction: Transaction): Promise<void> {
    await this.prisma.transaction.upsert({
      where: { id: transaction.id },
      create: paraLinha(transaction),
      update: paraLinha(transaction),
    });
  }

  // O filtro vai na CONSULTA (RN-015). Filtrar depois, em memory, ja teria
  // trazido o dado alheio para dentro do processo — e para o log.
  async listarDoHolder(holderId: HolderId): Promise<readonly Transaction[]> {
    const linhas = await this.prisma.transaction.findMany({
      where: { holderId },
      orderBy: { dueDate: 'asc' },
    });
    return linhas.map(paraEntidade);
  }

  async salvarSincronizados(lancamentos: readonly Transaction[]): Promise<void> {
    const existentes = new Set<string>();
    for (const l of lancamentos) {
      if (l.externalId === null) continue;
      const linha = await this.prisma.transaction.findFirst({
        where: { holderId: l.holderId, externalId: l.externalId },
        select: { id: true },
      });
      if (linha) existentes.add(l.externalId);
    }
    for (const l of lancamentos) {
      if (l.externalId !== null && existentes.has(l.externalId)) continue;
      await this.prisma.transaction.create({
        data: {
          id: l.id,
          holderId: l.holderId,
          description: l.description,
          amountInCents: l.amountInCents,
          dueDate: l.dueDate,
          externalId: l.externalId,
        },
      });
    }
  }

  async deleteByHolder(holderId: HolderId): Promise<void> {
    await this.prisma.transaction.deleteMany({ where: { holderId } });
  }

  /** So para teste de integracao: limpa a tabela entre cenarios. */
  async limparTudo(): Promise<void> {
    await this.prisma.transaction.deleteMany();
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

function paraLinha(l: Transaction): LinhaDeTransaction {
  return {
    id: l.id,
    holderId: l.holderId,
    description: l.description,
    readableDescription: l.readableDescription,
    amountInCents: l.amountInCents,
    dueDate: l.dueDate,
    externalId: l.externalId,
  };
}

function paraEntidade(linha: LinhaDeTransaction): Transaction {
  return {
    id: linha.id,
    holderId: linha.holderId as HolderId,
    description: linha.description,
    readableDescription: linha.readableDescription,
    amountInCents: linha.amountInCents,
    dueDate: linha.dueDate,
    externalId: linha.externalId,
  };
}
