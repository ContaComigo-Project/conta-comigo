import { describe, expect, it } from 'vitest';
import type { HolderId } from '../domain/model/holder';
import type { Transaction } from '../domain/model/transaction';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';
import { ListarTransactionsUseCase } from './list-transactions';

describe('ListarTransactionsUseCase', () => {
  it('retorna os lancamentos pertencentes ao titular resolvido', async () => {
    const transactionsDeTeste: Transaction[] = [
      {
        id: 'tx-1',
        holderId: 'holder-1' as HolderId,
        externalId: 'ext-1',
        description: 'UBER TRIP',
        readableDescription: 'Uber',
        amountInCents: -2500,
        dueDate: new Date('2026-09-01T10:00:00Z'),
        category: 'transporte',
        categoryOrigin: 'automatica',
      },
    ];

    const repo: RepositorioDeTransactions = {
      salvar: async () => {},
      listarDoHolder: async (holderId) => (holderId === 'holder-1' ? transactionsDeTeste : []),
      buscarDoHolder: async () => null,
      salvarSincronizados: async () => {},
      deleteByHolder: async () => {},
    };

    const useCase = new ListarTransactionsUseCase(repo);
    const resultado = await useCase.executar('holder-1' as HolderId);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('tx-1');
    expect(resultado[0].readableDescription).toBe('Uber');

    const vazio = await useCase.executar('holder-outro' as HolderId);
    expect(vazio).toHaveLength(0);
  });
});
