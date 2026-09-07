import { PrismaPg } from '@prisma/adapter-pg';
import type { TitularId } from '../../../lancamentos/domain/model/titular';
import type { RepositorioDeSessoes, Sessao } from '../../domain/port/saida/repositorio-de-sessoes';
import { PrismaClient, type Sessao as LinhaDeSessao } from '../../../lancamentos/infrastructure/persistence/gerado/client';

const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class RepositorioDeSessoesPrisma implements RepositorioDeSessoes {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async criar(sessao: Sessao): Promise<void> {
    await this.prisma.sessao.create({ data: { ...sessao } });
  }

  async porHashDoRefresh(hash: string): Promise<Sessao | null> {
    const linha = await this.prisma.sessao.findUnique({ where: { hashDoRefresh: hash } });
    return linha ? paraEntidade(linha) : null;
  }

  async revogar(id: string, quando: Date): Promise<void> {
    await this.prisma.sessao.update({ where: { id }, data: { revogadoEm: quando } });
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

function paraEntidade(linha: LinhaDeSessao): Sessao {
  return {
    id: linha.id,
    titularId: linha.titularId as TitularId,
    hashDoRefresh: linha.hashDoRefresh,
    expiraEm: linha.expiraEm,
    revogadoEm: linha.revogadoEm,
  };
}
