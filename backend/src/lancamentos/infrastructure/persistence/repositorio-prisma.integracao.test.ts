import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { RepositorioDeLancamentosPrisma } from './repositorio-prisma';
import type { Lancamento } from '../../domain/model/lancamento';
import { titularId } from '../../domain/model/titular';

const TITULAR_A = titularId('titular-a');
const TITULAR_B = titularId('titular-b');

// Teste de INTEGRACAO: fala com o PostgreSQL do docker compose, com as
// migracoes aplicadas por `harness setup`. Por isso NAO roda em
// `test-unitario` (ADR-003: unitario sem banco) — roda em `test-integracao`.
describe('RepositorioDeLancamentosPrisma — ida e volta no PostgreSQL real', () => {
  const repositorio = new RepositorioDeLancamentosPrisma();

  beforeEach(async () => {
    await repositorio.limparTudo();
  });

  afterAll(async () => {
    await repositorio.encerrar();
  });

  it('um lancamento salvo volta identico pela entidade de dominio', async () => {
    const original: Lancamento = {
      id: 'l-001',
      titularId: TITULAR_A,
      descricao: 'mercado',
      valorEmCentavos: 12_345,
      dataDeCompetencia: new Date('2026-01-31T23:59:00-03:00'),
    };

    await repositorio.salvar(original);
    const todos = await repositorio.listarDoTitular(TITULAR_A);

    expect(todos).toHaveLength(1);
    expect(todos[0]).toEqual(original);
    // A data volta como Date com o MESMO instante — nao como string, nao com fuso perdido.
    expect(todos[0].dataDeCompetencia.toISOString()).toBe(original.dataDeCompetencia.toISOString());
  });

  it('lista vazia quando nao ha lancamentos', async () => {
    expect(await repositorio.listarDoTitular(TITULAR_A)).toEqual([]);
  });

  it('varios lancamentos voltam todos, sem duplicar', async () => {
    for (const i of [1, 2, 3]) {
      await repositorio.salvar({ id: `l-${i}`, titularId: TITULAR_A, descricao: `item ${i}`, valorEmCentavos: i * 100, dataDeCompetencia: new Date('2026-02-10T12:00:00Z') });
    }
    const ids = (await repositorio.listarDoTitular(TITULAR_A)).map((l) => l.id).sort();
    expect(ids).toEqual(['l-1', 'l-2', 'l-3']);
  });

  it('RN-015 — o filtro por titular acontece na consulta: dado de A nao volta para B', async () => {
    await repositorio.salvar({ id: 'de-a', titularId: TITULAR_A, descricao: 'mercado', valorEmCentavos: 100, dataDeCompetencia: new Date('2026-02-10T12:00:00Z') });
    await repositorio.salvar({ id: 'de-b', titularId: TITULAR_B, descricao: 'farmacia', valorEmCentavos: 200, dataDeCompetencia: new Date('2026-02-10T12:00:00Z') });

    expect((await repositorio.listarDoTitular(TITULAR_B)).map((l) => l.id)).toEqual(['de-b']);
    expect((await repositorio.listarDoTitular(TITULAR_A)).map((l) => l.id)).toEqual(['de-a']);
  });
});
