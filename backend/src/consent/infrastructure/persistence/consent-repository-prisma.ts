import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Consent as LinhaDeConsent } from '../../../transactions/infrastructure/persistence/gerado/client';
import { estaAtivo, type Consent } from '../../domain/model/consent';
import type { ConsentRepository } from '../../domain/port/driven/consent-repository';

// Real adapter. Translates row to entity; no Prisma type leaves here (ADR-002
// r.1 and r.2).
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

function paraEntidade(linha: LinhaDeConsent): Consent {
  return {
    id: linha.id,
    holderId: linha.holderId,
    institutionId: linha.institutionId,
    connectionId: linha.connectionId,
    scope: linha.scope,
    credentialCipher: linha.credentialCipher,
    createdAt: linha.createdAt,
    expiresAt: linha.expiresAt,
    revokedAt: linha.revokedAt,
    lastSyncAt: linha.lastSyncAt,
  };
}

export class ConsentRepositoryPrisma implements ConsentRepository {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async save(consent: Consent): Promise<void> {
    const linha = {
      id: consent.id,
      holderId: consent.holderId,
      institutionId: consent.institutionId,
      connectionId: consent.connectionId,
      scope: consent.scope,
      credentialCipher: consent.credentialCipher,
      createdAt: consent.createdAt,
      expiresAt: consent.expiresAt,
      revokedAt: consent.revokedAt,
      lastSyncAt: consent.lastSyncAt,
    };
    await this.prisma.consent.upsert({ where: { id: consent.id }, create: linha, update: linha });
  }

  async findActiveByInstitution(holderId: string, institutionId: string, agora: Date): Promise<Consent | null> {
    const linha = await this.prisma.consent.findFirst({
      where: { holderId, institutionId },
      orderBy: { createdAt: 'desc' },
    });
    const consent = linha ? paraEntidade(linha) : null;
    return consent && estaAtivo(consent, agora) ? consent : null;
  }

  async listByHolder(holderId: string): Promise<readonly Consent[]> {
    const linhas = await this.prisma.consent.findMany({ where: { holderId }, orderBy: { createdAt: 'desc' } });
    return linhas.map(paraEntidade);
  }

  async findById(holderId: string, consentId: string): Promise<Consent | null> {
    const linha = await this.prisma.consent.findUnique({ where: { id: consentId } });
    if (!linha || linha.holderId !== holderId) return null;
    return paraEntidade(linha);
  }

  async updateLastSyncAt(consentId: string, agora: Date): Promise<void> {
    await this.prisma.consent.update({ where: { id: consentId }, data: { lastSyncAt: agora } });
  }

  async revoke(consentId: string, agora: Date): Promise<void> {
    await this.prisma.consent.update({ where: { id: consentId }, data: { revokedAt: agora } });
  }
}