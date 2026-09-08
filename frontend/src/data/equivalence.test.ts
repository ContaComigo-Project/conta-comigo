import { describe, expect, it } from 'vitest';
import { TransactionDTO, ConnectedBankDTO, SpendingCategoryDTO } from '@contacomigo/contract';
import { mockConnectedBanks } from '../mocks/connected-banks.mock';
import { mockSpendingCategories } from '../mocks/spending-categories.mock';
import { mockTransactions } from '../mocks/transactions.mock';
import { FakeSource } from './fake-source';
import { paraConnectedBanks, paraSpendingCategories, paraTransactions } from './mappers';

// Story scenario: "switching the data source does not change the screen". If
// mappers(FakeSource) produces the SAME object the mock exports today, the
// component that receives either renders the same — without being touched.
//
// Fixed clock: the mocks carry relative labels ("Hoje, 10:02", "3 min atrás")
// and dates relative to Date.now(). The fake source and the mappers receive the
// same `agora` so the result is deterministic.
const AGORA = new Date('2026-09-07T13:02:00.000Z'); // 10:02 in São Paulo

const semData = (t: object) => Object.fromEntries(Object.entries(t).filter(([chave]) => chave !== 'date'));

describe('HT-017 — equivalence mock ≡ mappers(FakeSource)', () => {
  const origem = new FakeSource(AGORA);

  it('the fake source delivers data valid by the contract', async () => {
    const r = await origem.listarTransactions();
    expect(r.estado).toBe('ok');
    if (r.estado !== 'ok') return;
    expect(r.dados.length).toBeGreaterThan(0);
    for (const l of r.dados) expect(TransactionDTO.safeParse(l).success, JSON.stringify(l)).toBe(true);
    const b = await origem.listarBancosConectados();
    if (b.estado === 'ok') for (const x of b.dados) expect(ConnectedBankDTO.safeParse(x).success).toBe(true);
    const c = await origem.listarCategoriasDeGasto();
    if (c.estado === 'ok') for (const x of c.dados) expect(SpendingCategoryDTO.safeParse(x).success).toBe(true);
  });

  it('transactions: same presentation object as mockTransactions (except the `date` instant)', async () => {
    const r = await origem.listarTransactions();
    if (r.estado !== 'ok') throw new Error('esperava ok');
    const mapeados = paraTransactions(r.dados, AGORA);
    expect(mapeados.map(semData)).toEqual(mockTransactions.map(semData));
  });

  it('connected banks: same object as mockConnectedBanks', async () => {
    const r = await origem.listarBancosConectados();
    if (r.estado !== 'ok') throw new Error('esperava ok');
    expect(paraConnectedBanks(r.dados, AGORA)).toEqual(mockConnectedBanks);
  });

  it('spending categories: same object as mockSpendingCategories, with percentage derived from totals', async () => {
    const r = await origem.listarCategoriasDeGasto();
    if (r.estado !== 'ok') throw new Error('esperava ok');
    expect(paraSpendingCategories(r.dados)).toEqual(mockSpendingCategories);
  });
});