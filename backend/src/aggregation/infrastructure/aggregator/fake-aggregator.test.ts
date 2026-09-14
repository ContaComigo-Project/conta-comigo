import { describe, expect, it } from 'vitest';
import { FakeAggregator } from './fake-aggregator';

// O falso precisa ser DETERMINÍSTICO: se ele variasse, um teste que depende dele
// falharia de vez em quando, e "às vezes vermelho" é pior que vermelho — ninguém
// confia e todos passam a reexecutar até passar.
const CONEXAO = 'conexao-1';
const DESDE = new Date('2026-01-01T00:00:00Z');

describe('FakeAggregator', () => {
  const aggregator = new FakeAggregator();

  it('devolve accounts para uma conexão conhecida', async () => {
    const resultado = await aggregator.listarAccounts(CONEXAO);
    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;

    expect(resultado.dados.length).toBeGreaterThan(0);
    for (const account of resultado.dados) {
      expect(account.idExterno).toBeTruthy();
      expect(Number.isInteger(account.saldoEmCentavos), 'saldo precisa ser inteiro (RN-006)').toBe(true);
    }
  });

  it('inclui um cartão de crédito — RN-009 trata cartão como fatura, não como saldo', async () => {
    const resultado = await aggregator.listarAccounts(CONEXAO);
    if (resultado.tipo !== 'ok') throw new Error('esperava ok');
    expect(resultado.dados.map((c) => c.tipo)).toContain('cartao-de-credito');
  });

  it('a mesma conexão devolve sempre o mesmo dado', async () => {
    const primeira = await aggregator.listarAccounts(CONEXAO);
    const segunda = await aggregator.listarAccounts(CONEXAO);
    expect(primeira).toEqual(segunda);
  });

  it('conexão desconhecida responde "não encontrado", não lista vazia', async () => {
    // Vazio e inexistente são coisas diferentes: confundi-las esconde error de
    // configuração atrás de uma tela que apenas parece sem movimento.
    const resultado = await aggregator.listarAccounts('conexao-que-nao-existe');
    expect(resultado.tipo).toBe('falha');
    if (resultado.tipo !== 'falha') return;
    expect(resultado.motivo).toBe('nao-encontrado');
  });

  it('devolve lançamentos com valor inteiro e data', async () => {
    const resultado = await aggregator.listarTransactions(CONEXAO, DESDE);
    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;

    expect(resultado.dados.length).toBeGreaterThan(0);
    for (const transaction of resultado.dados) {
      expect(Number.isInteger(transaction.amountInCents)).toBe(true);
      expect(transaction.dueDate).toBeInstanceOf(Date);
      expect(transaction.descriptionOriginal).toBeTruthy();
    }
  });

  it('respeita o corte de data: nada anterior a `desde`', async () => {
    const corte = new Date('2026-02-01T00:00:00Z');
    const resultado = await aggregator.listarTransactions(CONEXAO, corte);
    if (resultado.tipo !== 'ok') throw new Error('esperava ok');

    for (const transaction of resultado.dados) {
      expect(transaction.dueDate.getTime()).toBeGreaterThanOrEqual(corte.getTime());
    }
  });

  it('todo lançamento aponta para uma account que existe na mesma conexão', async () => {
    const accounts = await aggregator.listarAccounts(CONEXAO);
    const transactions = await aggregator.listarTransactions(CONEXAO, DESDE);
    if (accounts.tipo !== 'ok' || transactions.tipo !== 'ok') throw new Error('esperava ok');

    const idsDeAccounts = new Set(accounts.dados.map((c) => c.idExterno));
    for (const transaction of transactions.dados) {
      expect(idsDeAccounts.has(transaction.idDaAccountExterna), `${transaction.idExterno} aponta para account inexistente`).toBe(true);
    }
  });
});
