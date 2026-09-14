import { PrismaPg } from '@prisma/adapter-pg';
import type { Conselho } from '../../domain/model/advice';
import type { AdviceCache } from '../../domain/port/driven/advice-cache';
import { PrismaClient } from '../../../transactions/infrastructure/persistence/gerado/client';

// Adaptador real do cache (ADR-002, RNF-010). O custo evitado precisa
// sobreviver ao reinicio: cache de processo pagaria o provedor de novo a cada
// deploy.
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class AdviceCachePrisma implements AdviceCache {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async buscar(chave: string): Promise<Conselho | null> {
    const linha = await this.prisma.aiAdviceCache.findUnique({ where: { key: chave } });
    return linha ? { texto: linha.text, origem: 'cache' } : null;
  }

  async guardar(chave: string, conselho: Conselho): Promise<void> {
    await this.prisma.aiAdviceCache.upsert({
      where: { key: chave },
      create: { key: chave, text: conselho.texto },
      update: { text: conselho.texto },
    });
  }

  /** Só para teste de integração: o banco de dev é o único alvo. */
  async limparTudo(): Promise<void> {
    await this.prisma.aiAdviceCache.deleteMany();
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
