import { PrismaPg } from '@prisma/adapter-pg';
import type { Account } from '../../domain/model/account';
import { email as fazerEmail, type Email } from '../../domain/model/email';
import type { RepositorioDeAccounts } from '../../domain/port/driven/account-repository';
import { PrismaClient, type Account as LinhaDeAccount } from '../../../transactions/infrastructure/persistence/gerado/client';

// Adaptador real. Traduz linha em entidade; nenhum tipo do Prisma sai daqui
// (ADR-002 r.1 e r.2).
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class RepositorioDeAccountsPrisma implements RepositorioDeAccounts {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async porEmail(email: Email): Promise<Account | null> {
    return paraEntidade(await this.prisma.account.findUnique({ where: { email } }));
  }

  async porId(id: string): Promise<Account | null> {
    return paraEntidade(await this.prisma.account.findUnique({ where: { id } }));
  }

  async salvar(account: Account): Promise<void> {
    const linha = { id: account.id, email: account.email, passwordHash: account.passwordHash };
    await this.prisma.account.upsert({ where: { id: account.id }, create: linha, update: linha });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.account.deleteMany({ where: { id } });
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

function paraEntidade(linha: LinhaDeAccount | null): Account | null {
  return linha ? { id: linha.id, email: fazerEmail(linha.email), passwordHash: linha.passwordHash } : null;
}
