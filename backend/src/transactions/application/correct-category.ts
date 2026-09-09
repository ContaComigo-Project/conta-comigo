import { categoriaValida } from '../domain/model/category';
import type { HolderId } from '../domain/model/holder';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';

// RF-012: a pessoa corrige a categoria. RN-011: a partir daqui, a categoria e
// MANUAL — nenhuma sincronizacao, regra ou modelo a sobrescreve.
//
// RN-015: o lancamento e buscado PELO titular. Id de outra pessoa devolve
// "nao encontrado", e nao uma negacao que confirmaria a existencia do recurso.

export interface CorrecaoDeCategoria {
  readonly holderId: HolderId;
  readonly transactionId: string;
  readonly category: string;
}

export type ResultadoDaCorrecao =
  | { readonly tipo: 'corrigida' }
  | { readonly tipo: 'nao-encontrado' }
  | { readonly tipo: 'categoria-invalida' };

export class CorrectCategory {
  constructor(private readonly repositorio: RepositorioDeTransactions) {}

  async executar(correcao: CorrecaoDeCategoria): Promise<ResultadoDaCorrecao> {
    // A validacao vem antes da busca: categoria invalida nao justifica nem uma
    // consulta ao banco.
    if (!categoriaValida(correcao.category)) return { tipo: 'categoria-invalida' };

    const lancamento = await this.repositorio.buscarDoHolder(correcao.holderId, correcao.transactionId);
    if (!lancamento) return { tipo: 'nao-encontrado' };

    await this.repositorio.salvar({
      ...lancamento,
      category: correcao.category,
      categoryOrigin: 'manual',
    });

    return { tipo: 'corrigida' };
  }
}
