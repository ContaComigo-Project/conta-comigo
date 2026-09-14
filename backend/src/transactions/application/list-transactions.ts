import type { Transaction } from '../domain/model/transaction';
import type { HolderId } from '../domain/model/holder';
import type { ListarTransactions } from '../domain/port/driving/list-transactions';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';

// Recebe o holder JA RESOLVIDO (a borda o obtem da Identity): o caso de uso
// nao conhece cabecalho nem token (ADR-001, regra adicional 4).
export class ListarTransactionsUseCase implements ListarTransactions {
  constructor(private readonly repositorio: RepositorioDeTransactions) {}

  async executar(holderId: HolderId): Promise<readonly Transaction[]> {
    return this.repositorio.listarDoHolder(holderId);
  }
}
