import { PrismaPg } from '@prisma/adapter-pg';
import type { Lancamento } from '../../domain/model/lancamento';
import type { RepositorioDeLancamentos } from '../../domain/port/saida/repositorio-de-lancamentos';
import { PrismaClient, type Lancamento as LinhaDeLancamento } from './gerado/client';

// Adaptador real de persistencia (ADR-002). Unico lugar que conhece o Prisma:
// o cliente gerado vive em ./gerado, dentro de persistence/, e nenhum tipo dele
// sai deste arquivo — a traducao para a entidade acontece aqui.
const URL_PADRAO = 'postgresql://contacomigo:contacomigo_dev_local@localhost:5433/contacomigo';

export class RepositorioDeLancamentosPrisma implements RepositorioDeLancamentos {
  private readonly prisma: PrismaClient;

  constructor(connectionString = process.env.DATABASE_URL ?? URL_PADRAO) {
    this.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  }

  async salvar(lancamento: Lancamento): Promise<void> {
    await this.prisma.lancamento.upsert({
      where: { id: lancamento.id },
      create: paraLinha(lancamento),
      update: paraLinha(lancamento),
    });
  }

  async listarTodos(): Promise<readonly Lancamento[]> {
    const linhas = await this.prisma.lancamento.findMany({ orderBy: { dataDeCompetencia: 'asc' } });
    return linhas.map(paraEntidade);
  }

  /** So para teste de integracao: limpa a tabela entre cenarios. */
  async limparTudo(): Promise<void> {
    await this.prisma.lancamento.deleteMany();
  }

  async encerrar(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

function paraLinha(l: Lancamento): LinhaDeLancamento {
  return { id: l.id, descricao: l.descricao, valorEmCentavos: l.valorEmCentavos, dataDeCompetencia: l.dataDeCompetencia };
}

function paraEntidade(linha: LinhaDeLancamento): Lancamento {
  return {
    id: linha.id,
    descricao: linha.descricao,
    valorEmCentavos: linha.valorEmCentavos,
    dataDeCompetencia: linha.dataDeCompetencia,
  };
}
