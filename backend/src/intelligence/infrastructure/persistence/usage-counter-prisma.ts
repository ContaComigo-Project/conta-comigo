import { PrismaPg } from '@prisma/adapter-pg';
import type { UsageCounter } from '../../domain/port/driven/usage-counter';
import { PrismaClient } from '../../../transactions/infrastructure/persistence/gerado/client';

// Adaptador real do contador (ADR-002). O uso precisa sobreviver ao reinicio do
// processo: um contador em memoria zeraria o teto a cada deploy, que e o mesmo
// que nao ter teto (RNF-009).
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class UsageCounterPrisma implements UsageCounter {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async usoDoDia(holder: string, dia: string): Promise<number> {
    const linha = await this.prisma.aiDailyUsage.findUnique({ where: { holderId_day: { holderId: holder, day: dia } } });
    return linha?.calls ?? 0;
  }

  // Incremento atomico: duas abas da mesma pessoa pedindo ao mesmo tempo nao
  // podem ler 5, somar 1 e gravar 6 as duas.
  async registrarUso(holder: string, dia: string): Promise<void> {
    await this.prisma.aiDailyUsage.upsert({
      where: { holderId_day: { holderId: holder, day: dia } },
      create: { holderId: holder, day: dia, calls: 1 },
      update: { calls: { increment: 1 } },
    });
  }

  /** Só para teste de integração: o banco de dev é o único alvo. */
  async limparTudo(): Promise<void> {
    await this.prisma.aiDailyUsage.deleteMany();
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
