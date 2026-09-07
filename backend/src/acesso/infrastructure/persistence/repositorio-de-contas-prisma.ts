import { PrismaPg } from '@prisma/adapter-pg';
import type { Conta } from '../../domain/model/conta';
import { email as fazerEmail, type Email } from '../../domain/model/email';
import type { RepositorioDeContas } from '../../domain/port/saida/repositorio-de-contas';
import { PrismaClient, type Conta as LinhaDeConta } from '../../../lancamentos/infrastructure/persistence/gerado/client';

// Adaptador real. Traduz linha em entidade; nenhum tipo do Prisma sai daqui
// (ADR-002 r.1 e r.2).
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class RepositorioDeContasPrisma implements RepositorioDeContas {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async porEmail(email: Email): Promise<Conta | null> {
    return paraEntidade(await this.prisma.conta.findUnique({ where: { email } }));
  }

  async porId(id: string): Promise<Conta | null> {
    return paraEntidade(await this.prisma.conta.findUnique({ where: { id } }));
  }

  async salvar(conta: Conta): Promise<void> {
    const linha = { id: conta.id, email: conta.email, hashDaSenha: conta.hashDaSenha };
    await this.prisma.conta.upsert({ where: { id: conta.id }, create: linha, update: linha });
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

function paraEntidade(linha: LinhaDeConta | null): Conta | null {
  return linha ? { id: linha.id, email: fazerEmail(linha.email), hashDaSenha: linha.hashDaSenha } : null;
}
