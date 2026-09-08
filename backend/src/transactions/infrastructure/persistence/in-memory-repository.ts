import type { Transaction } from '../../domain/model/transaction';
import type { HolderId } from '../../domain/model/holder';
import type { RepositorioDeTransactions } from '../../domain/port/driven/transaction-repository';

// Adaptador falso (ADR-001). A persistencia real e o RepositorioDeTransactionsPrisma.
export class RepositorioDeTransactionsEmMemoria implements RepositorioDeTransactions {
  private readonly itens: Transaction[];

  constructor(itens: readonly Transaction[] = []) {
    this.itens = [...itens];
  }

  async listarDoHolder(holderId: HolderId): Promise<readonly Transaction[]> {
    return this.itens.filter((l) => l.holderId === holderId);
  }

  async salvarSincronizados(lancamentos: readonly Transaction[]): Promise<void> {
    for (const l of lancamentos) {
      const jaExiste = l.externalId !== null && this.itens.some(
        (x) => x.holderId === l.holderId && x.externalId === l.externalId,
      );
      if (!jaExiste) this.itens.push(l);
    }
  }

  async deleteByHolder(holderId: HolderId): Promise<void> {
    for (let i = this.itens.length - 1; i >= 0; i -= 1) {
      if (this.itens[i].holderId === holderId) this.itens.splice(i, 1);
    }
  }
}
