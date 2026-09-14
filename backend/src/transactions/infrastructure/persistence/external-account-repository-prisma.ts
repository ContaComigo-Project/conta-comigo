import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type ExternalAccount as Linha } from '../../../transactions/infrastructure/persistence/gerado/client';
import type { ExternalAccount, TipoDeAccountExterna } from '../../domain/model/external-account';
import type { ExternalAccountRepository } from '../../domain/port/driven/external-account-repository';
import type { HolderId } from '../../domain/model/holder';

const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class ExternalAccountRepositoryPrisma implements ExternalAccountRepository {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async salvarSincronizadas(contas: readonly ExternalAccount[], holderId: HolderId): Promise<void> {
    await this.prisma.externalAccount.deleteMany({ where: { holderId } });
    for (const c of contas) {
      await this.prisma.externalAccount.create({
        data: {
          id: c.id,
          holderId: c.holderId,
          externalId: c.externalId,
          institutionId: c.institutionId,
          type: c.type,
          balanceInCents: c.balanceInCents,
        },
      });
    }
  }

  async listarDoHolder(holderId: HolderId): Promise<readonly ExternalAccount[]> {
    const linhas = await this.prisma.externalAccount.findMany({ where: { holderId } });
    return linhas.map((l: Linha) => ({
      id: l.id,
      holderId: l.holderId as HolderId,
      externalId: l.externalId,
      institutionId: l.institutionId,
      type: l.type as TipoDeAccountExterna,
      balanceInCents: l.balanceInCents,
    }));
  }
}