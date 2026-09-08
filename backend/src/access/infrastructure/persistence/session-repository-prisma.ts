import { PrismaPg } from '@prisma/adapter-pg';
import type { HolderId } from '../../../transactions/domain/model/holder';
import type { SessionRepository, Session } from '../../domain/port/driven/session-repository';
import { PrismaClient, type Session as LinhaDeSession } from '../../../transactions/infrastructure/persistence/gerado/client';

const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class SessionRepositoryPrisma implements SessionRepository {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async criar(session: Session): Promise<void> {
    await this.prisma.session.create({ data: { ...session } });
  }

  async porHashDoRefresh(hash: string): Promise<Session | null> {
    const linha = await this.prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    return linha ? paraEntidade(linha) : null;
  }

  async revogar(id: string, quando: Date): Promise<void> {
    await this.prisma.session.update({ where: { id }, data: { revokedAt: quando } });
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

function paraEntidade(linha: LinhaDeSession): Session {
  return {
    id: linha.id,
    holderId: linha.holderId as HolderId,
    refreshTokenHash: linha.refreshTokenHash,
    expiresAt: linha.expiresAt,
    revokedAt: linha.revokedAt,
  };
}
