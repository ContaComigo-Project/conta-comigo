import { describe, expect, it } from 'vitest';
import { holderId } from '../../domain/model/holder';
import { RepositorioDeTransactionsEmMemoria } from './in-memory-repository';
import type { Transaction } from '../../domain/model/transaction';

const HOLDER = holderId('holder-a');

const lancamento = (externalId: string | null, amountInCents: number): Transaction => ({
  id: `${externalId ?? 'null'}-${amountInCents}`,
  holderId: HOLDER,
  description: 'x', readableDescription: null,
  amountInCents,
  dueDate: new Date('2026-02-01T12:00:00Z'),
  externalId,
});

describe('HN-003 — sincronização não duplica lançamentos (RN-008)', () => {
  it('mesmo identificador externo e mesmo titular não duplicam', async () => {
    const repo = new RepositorioDeTransactionsEmMemoria();
    await repo.salvarSincronizados([lancamento('ext-1', -100_00)]);
    await repo.salvarSincronizados([lancamento('ext-1', -100_00)]);

    expect((await repo.listarDoHolder(HOLDER)).length).toBe(1);
  });

  it('lançamentos distintos (externalId diferente) persistem todos', async () => {
    const repo = new RepositorioDeTransactionsEmMemoria();
    await repo.salvarSincronizados([lancamento('ext-1', -100_00), lancamento('ext-2', -200_00)]);

    expect((await repo.listarDoHolder(HOLDER)).length).toBe(2);
  });

  it('lançamento sem identificador externo nunca é considerado duplicado', async () => {
    const repo = new RepositorioDeTransactionsEmMemoria();
    await repo.salvarSincronizados([lancamento(null, -100_00)]);
    await repo.salvarSincronizados([lancamento(null, -100_00)]);

    expect((await repo.listarDoHolder(HOLDER)).length).toBe(2);
  });
});