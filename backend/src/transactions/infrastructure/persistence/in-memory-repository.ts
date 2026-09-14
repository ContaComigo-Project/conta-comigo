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

  async buscarDoHolder(holderId: HolderId, transactionId: string): Promise<Transaction | null> {
    return this.itens.find((l) => l.holderId === holderId && l.id === transactionId) ?? null;
  }

  async salvar(transaction: Transaction): Promise<void> {
    const indice = this.itens.findIndex((l) => l.id === transaction.id);
    if (indice >= 0) this.itens[indice] = transaction;
  }

  async salvarSincronizados(lancamentos: readonly Transaction[]): Promise<void> {
    for (const l of lancamentos) {
      const indice =
        l.externalId === null
          ? -1
          : this.itens.findIndex((x) => x.holderId === l.holderId && x.externalId === l.externalId);

      if (indice < 0) {
        this.itens.push(l);
        continue;
      }

      // RN-011: categoria manual sobrevive a sincronizacao (mesma regra do
      // adaptador Prisma; se as duas divergirem, o teste de integracao acusa).
      const existente = this.itens[indice];
      this.itens[indice] =
        existente.categoryOrigin === 'manual'
          ? { ...l, category: existente.category, categoryOrigin: 'manual' }
          : l;
    }
  }

  async deleteByHolder(holderId: HolderId): Promise<void> {
    for (let i = this.itens.length - 1; i >= 0; i -= 1) {
      if (this.itens[i].holderId === holderId) this.itens.splice(i, 1);
    }
  }
}
