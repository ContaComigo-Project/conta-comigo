import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { RepositorioDeTransactionsPrisma } from './prisma-repository';
import type { Transaction } from '../../domain/model/transaction';
import { holderId } from '../../domain/model/holder';

const TITULAR_A = holderId('holder-a');
const TITULAR_B = holderId('holder-b');

// Teste de INTEGRACAO: fala com o PostgreSQL do docker compose, com as
// migracoes aplicadas por `harness setup`. Por isso NAO roda em
// `test-unitario` (ADR-003: unitario sem banco) — roda em `test-integracao`.
describe('RepositorioDeTransactionsPrisma — ida e volta no PostgreSQL real', () => {
  const repositorio = new RepositorioDeTransactionsPrisma();

  beforeEach(async () => {
    await repositorio.limparTudo();
  });

  afterAll(async () => {
    await repositorio.encerrar();
  });

  it('um transaction salvo volta identico pela entidade de dominio', async () => {
    const original: Transaction = {
      id: 'l-001',
      holderId: TITULAR_A,
      description: 'mercado', readableDescription: null,
      amountInCents: 12_345,
      dueDate: new Date('2026-01-31T23:59:00-03:00'),
      externalId: 'ext-original',
    };

    await repositorio.salvar(original);
    const todos = await repositorio.listarDoHolder(TITULAR_A);

    expect(todos).toHaveLength(1);
    expect(todos[0]).toEqual(original);
    // A data volta como Date com o MESMO instante — nao como string, nao com fuso perdido.
    expect(todos[0].dueDate.toISOString()).toBe(original.dueDate.toISOString());
  });

  it('lista vazia quando nao ha transactions', async () => {
    expect(await repositorio.listarDoHolder(TITULAR_A)).toEqual([]);
  });

  it('varios transactions voltam todos, sem duplicar', async () => {
    for (const i of [1, 2, 3]) {
      await repositorio.salvar({ id: `l-${i}`, holderId: TITULAR_A, description: `item ${i}`, readableDescription: null, amountInCents: i * 100, dueDate: new Date('2026-02-10T12:00:00Z') , externalId: null });
    }
    const ids = (await repositorio.listarDoHolder(TITULAR_A)).map((l) => l.id).sort();
    expect(ids).toEqual(['l-1', 'l-2', 'l-3']);
  });

  it('RN-015 — o filtro por holder acontece na consulta: dado de A nao volta para B', async () => {
    await repositorio.salvar({ id: 'de-a', holderId: TITULAR_A, description: 'mercado', readableDescription: null, amountInCents: 100, dueDate: new Date('2026-02-10T12:00:00Z') , externalId: null });
    await repositorio.salvar({ id: 'de-b', holderId: TITULAR_B, description: 'farmacia', readableDescription: null, amountInCents: 200, dueDate: new Date('2026-02-10T12:00:00Z') , externalId: null });

    expect((await repositorio.listarDoHolder(TITULAR_B)).map((l) => l.id)).toEqual(['de-b']);
    expect((await repositorio.listarDoHolder(TITULAR_A)).map((l) => l.id)).toEqual(['de-a']);
  });
});
