import { describe, expect, it } from 'vitest';
import { TransactionDTO, ConnectedBankDTO, SpendingCategoryDTO } from '@contacomigo/contrato';
import { mockConnectedBanks } from '../mocks/connected-banks.mock';
import { mockSpendingCategories } from '../mocks/spending-categories.mock';
import { mockTransactions } from '../mocks/transactions.mock';
import { OrigemFalsa } from './fake-source';
import { paraConnectedBanks, paraSpendingCategories, paraTransactions } from './mappers';

// Cenario da historia: "trocar a origem do dado nao muda a tela". Se
// mapeadores(OrigemFalsa) produz o MESMO objeto que o mock exporta hoje, o
// componente que recebe um ou outro renderiza igual — sem ser tocado.
//
// Clock fixo: os mocks carregam rotulos relativos ("Hoje, 10:02", "3 min
// atras") e datas relativas a Date.now(). A origem falsa e os mapeadores
// recebem o mesmo `agora` para o resultado ser deterministico.
const AGORA = new Date('2026-09-07T13:02:00.000Z'); // 10:02 em Sao Paulo

const semData = (t: object) => Object.fromEntries(Object.entries(t).filter(([chave]) => chave !== 'date'));

describe('HT-017 — equivalencia mock ≡ mapeadores(OrigemFalsa)', () => {
  const origem = new OrigemFalsa(AGORA);

  it('a origem falsa entrega dados validos pelo contrato', async () => {
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

  it('transactions: mesmo objeto de apresentacao que mockTransactions (exceto o instante `date`)', async () => {
    const r = await origem.listarTransactions();
    if (r.estado !== 'ok') throw new Error('esperava ok');
    const mapeados = paraTransactions(r.dados, AGORA);
    expect(mapeados.map(semData)).toEqual(mockTransactions.map(semData));
  });

  it('bancos conectados: mesmo objeto que mockConnectedBanks', async () => {
    const r = await origem.listarBancosConectados();
    if (r.estado !== 'ok') throw new Error('esperava ok');
    expect(paraConnectedBanks(r.dados, AGORA)).toEqual(mockConnectedBanks);
  });

  it('categorias de gasto: mesmo objeto que mockSpendingCategories, com percentual derivado dos totais', async () => {
    const r = await origem.listarCategoriasDeGasto();
    if (r.estado !== 'ok') throw new Error('esperava ok');
    expect(paraSpendingCategories(r.dados)).toEqual(mockSpendingCategories);
  });
});
