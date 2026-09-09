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
      description: 'mercado', readableDescription: null, category: null, categoryOrigin: null,
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
      await repositorio.salvar({ id: `l-${i}`, holderId: TITULAR_A, description: `item ${i}`, readableDescription: null, category: null, categoryOrigin: null, amountInCents: i * 100, dueDate: new Date('2026-02-10T12:00:00Z') , externalId: null });
    }
    const ids = (await repositorio.listarDoHolder(TITULAR_A)).map((l) => l.id).sort();
    expect(ids).toEqual(['l-1', 'l-2', 'l-3']);
  });

  it('RN-015 — o filtro por holder acontece na consulta: dado de A nao volta para B', async () => {
    await repositorio.salvar({ id: 'de-a', holderId: TITULAR_A, description: 'mercado', readableDescription: null, category: null, categoryOrigin: null, amountInCents: 100, dueDate: new Date('2026-02-10T12:00:00Z') , externalId: null });
    await repositorio.salvar({ id: 'de-b', holderId: TITULAR_B, description: 'farmacia', readableDescription: null, category: null, categoryOrigin: null, amountInCents: 200, dueDate: new Date('2026-02-10T12:00:00Z') , externalId: null });

    expect((await repositorio.listarDoHolder(TITULAR_B)).map((l) => l.id)).toEqual(['de-b']);
    expect((await repositorio.listarDoHolder(TITULAR_A)).map((l) => l.id)).toEqual(['de-a']);
  });

  it('RN-011 — a categoria MANUAL sobrevive a uma nova sincronizacao do mesmo lancamento', async () => {
    const original: Transaction = {
      id: 'l-manual',
      holderId: TITULAR_A,
      description: 'PAG*LOJA CENTRAL',
      readableDescription: 'Loja Central',
      category: 'alimentacao',
      categoryOrigin: 'automatica',
      amountInCents: -4_000,
      dueDate: new Date('2026-01-10T12:00:00Z'),
      externalId: 'ext-manual',
    };
    await repositorio.salvarSincronizados([original]);

    // A pessoa corrige (HN-005, RF-012).
    const encontrado = await repositorio.buscarDoHolder(TITULAR_A, 'l-manual');
    await repositorio.salvar({ ...encontrado!, category: 'lazer', categoryOrigin: 'manual' });

    // O agregador devolve o mesmo lancamento, com a classificacao automatica de
    // novo — e ela NAO pode vencer.
    await repositorio.salvarSincronizados([{ ...original, id: 'outro-id', category: 'alimentacao' }]);

    const depois = await repositorio.listarDoHolder(TITULAR_A);
    expect(depois).toHaveLength(1);
    expect(depois[0].category).toBe('lazer');
    expect(depois[0].categoryOrigin).toBe('manual');
  });

  it('a categoria AUTOMATICA e atualizada por uma nova sincronizacao', async () => {
    const original: Transaction = {
      id: 'l-auto',
      holderId: TITULAR_A,
      description: 'PAG*LOJA CENTRAL',
      readableDescription: 'Loja Central',
      category: null,
      categoryOrigin: null,
      amountInCents: -4_000,
      dueDate: new Date('2026-01-10T12:00:00Z'),
      externalId: 'ext-auto',
    };
    await repositorio.salvarSincronizados([original]);
    await repositorio.salvarSincronizados([{ ...original, category: 'lazer', categoryOrigin: 'automatica' }]);

    const depois = await repositorio.listarDoHolder(TITULAR_A);
    expect(depois[0].category).toBe('lazer');
    expect(depois[0].categoryOrigin).toBe('automatica');
  });

  it('RN-015 — buscarDoHolder nao devolve lancamento de outro titular', async () => {
    await repositorio.salvarSincronizados([
      {
        id: 'l-de-b',
        holderId: TITULAR_B,
        description: 'mercado',
        readableDescription: 'Mercado',
        category: null,
        categoryOrigin: null,
        amountInCents: -1_000,
        dueDate: new Date('2026-01-10T12:00:00Z'),
        externalId: 'ext-b',
      },
    ]);

    expect(await repositorio.buscarDoHolder(TITULAR_A, 'l-de-b')).toBeNull();
    expect(await repositorio.buscarDoHolder(TITULAR_B, 'l-de-b')).not.toBeNull();
  });
});
