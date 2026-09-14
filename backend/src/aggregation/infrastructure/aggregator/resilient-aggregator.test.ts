import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResilientAggregator, type PoliticaDeResiliencia } from './resilient-aggregator';
import { falha, ok, type ResultDaAgregacao } from '../../domain/model/aggregation-result';
import type { AccountExterna, TransactionExterno } from '../../domain/model/external-account';
import type { OpenFinanceAggregator } from '../../domain/port/driven/open-finance-aggregator';

// RNF-006: limite de espera e nova tentativa controlada. O tempo e falso — uma
// suite que espera 10 s de verdade a cada cenario deixa de ser rodada.
const POLITICA: PoliticaDeResiliencia = { limiteEmMs: 10_000, novasTentativas: 2, esperaBaseEmMs: 200 };

const CONTA: AccountExterna = {
  idExterno: 'account-1',
  instituicao: 'Banco Exemplo',
  tipo: 'corrente',
  saldoEmCentavos: 150_00,
};

/** Agregador de teste que registra quantas vezes foi chamado. */
function aggregatorQue(
  responses: Array<ResultDaAgregacao<readonly AccountExterna[]> | 'nunca-responde'>,
): OpenFinanceAggregator & { chamadas: number } {
  let indice = 0;
  return {
    chamadas: 0,
    async criarConexao() {
    return ok({ connectionId: 'conexao-teste', token: 'token-teste' });
  },
  async listarAccounts() {
      this.chamadas += 1;
      const response = responses[Math.min(indice++, responses.length - 1)];
      // "nunca-responde" simula o provedor pendurado: promessa que nao resolve.
      if (response === 'nunca-responde') return new Promise(() => {});
      return response;
    },
    async listarTransactions(): Promise<ResultDaAgregacao<readonly TransactionExterno[]>> {
      return ok([]);
    },
  };
}

describe('RNF-006 — limite de espera', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('provedor que nao responde e interrormpido no limite, com error tratavel', async () => {
    const interno = aggregatorQue(['nunca-responde']);
    const promessa = new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');

    // Um timeout e falha transitoria, entao o ciclo completo tem 3 tentativas.
    // Que cada uma pare no limite e o que o teste seguinte mede.
    await vi.runAllTimersAsync();
    const resultado = await promessa;

    // Erro de VALOR, nao excecao: e o que permite degradar em vez de derrubar.
    expect(resultado.tipo).toBe('falha');
    if (resultado.tipo !== 'falha') return;
    expect(resultado.motivo).toBe('indisponivel');
  });

  it('nao espera alem do limite mesmo com novas tentativas', async () => {
    const interno = aggregatorQue(['nunca-responde']);
    const promessa = new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');

    // Limite por chamada x 3 chamadas, mais as esperas entre elas.
    await vi.advanceTimersByTimeAsync(POLITICA.limiteEmMs * 3 + POLITICA.esperaBaseEmMs * 3 + 10);
    expect((await promessa).tipo).toBe('falha');
    expect(interno.chamadas).toBe(3);
  });
});

describe('RNF-006 — nova tentativa controlada', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('falha transitoria e tentada de novo e o sucesso e devolvido', async () => {
    const interno = aggregatorQue([
      falha('indisponivel', 'rede caiu'),
      falha('indisponivel', 'rede caiu'),
      ok([CONTA]),
    ]);

    const promessa = new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');
    await vi.runAllTimersAsync();
    const resultado = await promessa;

    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;
    expect(resultado.dados).toEqual([CONTA]);
    // Exatamente 3: a original + as 2 novas tentativas de RNF-006.
    expect(interno.chamadas).toBe(3);
  });

  it('tres falhas seguidas desistem — nao tenta uma quarta vez', async () => {
    const interno = aggregatorQue([falha('indisponivel', 'fora do ar')]);

    const promessa = new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');
    await vi.runAllTimersAsync();

    expect((await promessa).tipo).toBe('falha');
    expect(interno.chamadas).toBe(3);
  });

  it('error permanente NAO e tentado de novo — insistir nao conserta credencial', async () => {
    const interno = aggregatorQue([falha('credencial-invalida', 'chave revogada')]);

    const promessa = new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');
    await vi.runAllTimersAsync();
    const resultado = await promessa;

    expect(resultado.tipo).toBe('falha');
    if (resultado.tipo !== 'falha') return;
    expect(resultado.motivo).toBe('credencial-invalida');
    expect(interno.chamadas).toBe(1);
  });

  it('recurso inexistente tambem nao e tentado de novo', async () => {
    const interno = aggregatorQue([falha('nao-encontrado', 'conexao removida')]);

    const promessa = new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');
    await vi.runAllTimersAsync();

    expect((await promessa).tipo).toBe('falha');
    expect(interno.chamadas).toBe(1);
  });

  it('a espera entre tentativas cresce', async () => {
    const interno = aggregatorQue([falha('indisponivel', 'fora')]);
    const esperas: number[] = [];
    const clock = vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void, ms?: number) => {
      if (ms) esperas.push(ms);
      fn();
      return 0 as unknown as NodeJS.Timeout;
    }) as typeof setTimeout);

    await new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');
    clock.mockRestore();

    // Só as esperas entre tentativas; o limite de espera (10 s) também passa
    // pelo setTimeout e não é uma delas.
    const entreTentativas = esperas.filter((ms) => ms < POLITICA.limiteEmMs);
    expect(entreTentativas).toEqual([POLITICA.esperaBaseEmMs, POLITICA.esperaBaseEmMs * 2]);
    expect(entreTentativas[1]).toBeGreaterThan(entreTentativas[0]);
  });

  it('sucesso de primeira nao gera nova tentativa', async () => {
    const interno = aggregatorQue([ok([CONTA])]);

    const promessa = new ResilientAggregator(interno, POLITICA).listarAccounts('conexao-1');
    await vi.runAllTimersAsync();

    expect((await promessa).tipo).toBe('ok');
    expect(interno.chamadas).toBe(1);
  });
});
