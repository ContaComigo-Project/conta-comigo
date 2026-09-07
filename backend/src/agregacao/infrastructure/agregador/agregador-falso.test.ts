import { describe, expect, it } from 'vitest';
import { AgregadorFalso } from './agregador-falso';

// O falso precisa ser DETERMINÍSTICO: se ele variasse, um teste que depende dele
// falharia de vez em quando, e "às vezes vermelho" é pior que vermelho — ninguém
// confia e todos passam a reexecutar até passar.
const CONEXAO = 'conexao-1';
const DESDE = new Date('2026-01-01T00:00:00Z');

describe('AgregadorFalso', () => {
  const agregador = new AgregadorFalso();

  it('devolve contas para uma conexão conhecida', async () => {
    const resultado = await agregador.listarContas(CONEXAO);
    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;

    expect(resultado.dados.length).toBeGreaterThan(0);
    for (const conta of resultado.dados) {
      expect(conta.idExterno).toBeTruthy();
      expect(Number.isInteger(conta.saldoEmCentavos), 'saldo precisa ser inteiro (RN-006)').toBe(true);
    }
  });

  it('inclui um cartão de crédito — RN-009 trata cartão como fatura, não como saldo', async () => {
    const resultado = await agregador.listarContas(CONEXAO);
    if (resultado.tipo !== 'ok') throw new Error('esperava ok');
    expect(resultado.dados.map((c) => c.tipo)).toContain('cartao-de-credito');
  });

  it('a mesma conexão devolve sempre o mesmo dado', async () => {
    const primeira = await agregador.listarContas(CONEXAO);
    const segunda = await agregador.listarContas(CONEXAO);
    expect(primeira).toEqual(segunda);
  });

  it('conexão desconhecida responde "não encontrado", não lista vazia', async () => {
    // Vazio e inexistente são coisas diferentes: confundi-las esconde erro de
    // configuração atrás de uma tela que apenas parece sem movimento.
    const resultado = await agregador.listarContas('conexao-que-nao-existe');
    expect(resultado.tipo).toBe('falha');
    if (resultado.tipo !== 'falha') return;
    expect(resultado.motivo).toBe('nao-encontrado');
  });

  it('devolve lançamentos com valor inteiro e data', async () => {
    const resultado = await agregador.listarLancamentos(CONEXAO, DESDE);
    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;

    expect(resultado.dados.length).toBeGreaterThan(0);
    for (const lancamento of resultado.dados) {
      expect(Number.isInteger(lancamento.valorEmCentavos)).toBe(true);
      expect(lancamento.dataDeCompetencia).toBeInstanceOf(Date);
      expect(lancamento.descricaoOriginal).toBeTruthy();
    }
  });

  it('respeita o corte de data: nada anterior a `desde`', async () => {
    const corte = new Date('2026-02-01T00:00:00Z');
    const resultado = await agregador.listarLancamentos(CONEXAO, corte);
    if (resultado.tipo !== 'ok') throw new Error('esperava ok');

    for (const lancamento of resultado.dados) {
      expect(lancamento.dataDeCompetencia.getTime()).toBeGreaterThanOrEqual(corte.getTime());
    }
  });

  it('todo lançamento aponta para uma conta que existe na mesma conexão', async () => {
    const contas = await agregador.listarContas(CONEXAO);
    const lancamentos = await agregador.listarLancamentos(CONEXAO, DESDE);
    if (contas.tipo !== 'ok' || lancamentos.tipo !== 'ok') throw new Error('esperava ok');

    const idsDeContas = new Set(contas.dados.map((c) => c.idExterno));
    for (const lancamento of lancamentos.dados) {
      expect(idsDeContas.has(lancamento.idDaContaExterna), `${lancamento.idExterno} aponta para conta inexistente`).toBe(true);
    }
  });
});
