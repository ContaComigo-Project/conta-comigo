import type { Transaction } from '../../domain/model/transaction';
import type { HolderId } from '../../domain/model/holder';
import type { RepositorioDeTransactions } from '../../domain/port/driven/transaction-repository';

// Adaptador falso (ADR-001). A persistencia real e o RepositorioDeTransactionsPrisma.
export class RepositorioDeTransactionsEmMemoria implements RepositorioDeTransactions {
  constructor(private readonly itens: readonly Transaction[] = []) {}

  async listarDoHolder(holderId: HolderId): Promise<readonly Transaction[]> {
    return this.itens.filter((l) => l.holderId === holderId);
  }
}
