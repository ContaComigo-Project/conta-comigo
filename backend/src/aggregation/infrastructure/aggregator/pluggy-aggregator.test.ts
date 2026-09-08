import { describe, expect, it, vi } from 'vitest';
import { PluggyAggregator, CredencialDoAgregadorAusente } from './pluggy-aggregator';
import { redigir } from '../../../transactions/infrastructure/log/redactor';

// Nenhum teste desta história toca a rede: `buscar` é injetado. O que se prova
// aqui é a tradução da response, a classificação do error e a recusa sem
// credencial — não a disponibilidade do Sandbox.
const CREDENCIAL = { clientId: 'id-de-teste', clientSecret: 'segredo-de-teste' };

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Responde a autenticação e depois o que o cenário pedir. */
function buscarQue(...responses: Response[]): typeof fetch & { chamadas: string[] } {
  let indice = 0;
  const espiao = vi.fn(async (url: string | URL | Request) => {
    espiao.chamadas.push(String(url));
    return responses[Math.min(indice++, responses.length - 1)];
  }) as unknown as typeof fetch & { chamadas: string[] };
  espiao.chamadas = [];
  return espiao;
}

const autenticado = () => response({ apiKey: 'chave-de-session' });

describe('PluggyAggregator — credencial', () => {
  it('sem credencial no ambiente, recusa operar em vez de tentar anonimamente', () => {
    const semAmbiente = { ...process.env };
    delete semAmbiente.PLUGGY_CLIENT_ID;
    delete semAmbiente.PLUGGY_CLIENT_SECRET;
    vi.stubGlobal('process', { ...process, env: semAmbiente });

    expect(() => new PluggyAggregator()).toThrow(CredencialDoAgregadorAusente);
    vi.unstubAllGlobals();
  });

  it('a credencial não aparece na URL — vai no body da autenticação', async () => {
    const buscar = buscarQue(autenticado(), response({ results: [] }));
    await new PluggyAggregator({ ...CREDENCIAL, buscar }).listarAccounts('item-1');

    for (const url of buscar.chamadas) {
      expect(url).not.toContain(CREDENCIAL.clientSecret);
      expect(url).not.toContain(CREDENCIAL.clientId);
    }
  });

  it('o detalhe da falha não carrega credencial nem body da response (RNF-015)', async () => {
    // Provedor que ecoa o que recebeu — acontece em 4xx de API real. O marcador
    // é único de propósito: "invalid" seria substring de "credencial-invalida",
    // o nome do motivo, e o teste passaria a acusar vazamento onde não há.
    const ECO_DO_PROVEDOR = 'body-que-o-provedor-devolveu';
    const eco = response({ error: ECO_DO_PROVEDOR, enviado: CREDENCIAL }, 401);
    const resultado = await new PluggyAggregator({ ...CREDENCIAL, buscar: buscarQue(eco) }).listarAccounts('item-1');

    expect(resultado.tipo).toBe('falha');
    if (resultado.tipo !== 'falha') return;

    const emLog = JSON.stringify(redigir({ resultado }));
    expect(emLog).not.toContain(CREDENCIAL.clientSecret);
    expect(emLog).not.toContain(ECO_DO_PROVEDOR);
    // O que sobra é diagnóstico útil e inofensivo.
    expect(emLog).toContain('401');
  });
});

describe('PluggyAggregator — classificação de error', () => {
  const casos = [
    { status: 401, motivo: 'credencial-invalida' },
    { status: 403, motivo: 'credencial-invalida' },
    { status: 404, motivo: 'nao-encontrado' },
    { status: 422, motivo: 'credencial-invalida' },
    { status: 500, motivo: 'indisponivel' },
    { status: 503, motivo: 'indisponivel' },
  ] as const;

  for (const { status, motivo } of casos) {
    it(`${status} vira "${motivo}"`, async () => {
      const buscar = buscarQue(autenticado(), response({}, status));
      const resultado = await new PluggyAggregator({ ...CREDENCIAL, buscar }).listarAccounts('item-1');

      expect(resultado.tipo).toBe('falha');
      if (resultado.tipo !== 'falha') return;
      expect(resultado.motivo).toBe(motivo);
    });
  }

  it('rede fora vira "indisponivel" — transitório, então o decorador tenta de novo', async () => {
    const buscar = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;

    const resultado = await new PluggyAggregator({ ...CREDENCIAL, buscar }).listarAccounts('item-1');
    expect(resultado.tipo).toBe('falha');
    if (resultado.tipo !== 'falha') return;
    expect(resultado.motivo).toBe('indisponivel');
  });
});

describe('PluggyAggregator — tradução para o domínio', () => {
  it('account vira AccountExterna com saldo em centavos e tipo do domínio', async () => {
    const buscar = buscarQue(
      autenticado(),
      response({
        results: [
          { id: 'acc-1', name: 'Account', institution: { name: 'Banco X' }, type: 'BANK', balance: 2418.32 },
          { id: 'acc-2', name: 'Cartao', institution: { name: 'Banco X' }, type: 'CREDIT', balance: -874.5 },
        ],
      }),
    );

    const resultado = await new PluggyAggregator({ ...CREDENCIAL, buscar }).listarAccounts('item-1');
    if (resultado.tipo !== 'ok') throw new Error('esperava ok');

    expect(resultado.dados[0]).toEqual({
      idExterno: 'acc-1',
      instituicao: 'Banco X',
      tipo: 'corrente',
      saldoEmCentavos: 241832,
    });
    expect(resultado.dados[1].tipo).toBe('cartao-de-credito');
    expect(resultado.dados[1].saldoEmCentavos).toBe(-87450);
  });

  it('valor fracionário vira inteiro sem error de ponto flutuante (RN-006)', async () => {
    const buscar = buscarQue(
      autenticado(),
      response({ results: [{ id: 't-1', accountId: 'acc-1', description: 'X', amount: -34.9, date: '2026-02-05' }] }),
    );

    const resultado = await new PluggyAggregator({ ...CREDENCIAL, buscar }).listarTransactions('item-1', new Date('2026-01-01'));
    if (resultado.tipo !== 'ok') throw new Error('esperava ok');

    // -34.9 * 100 em ponto flutuante dá -3489.9999...; o adaptador arredonda.
    expect(resultado.dados[0].amountInCents).toBe(-3490);
    expect(Number.isInteger(resultado.dados[0].amountInCents)).toBe(true);
  });

  it('response sem resultados vira lista vazia, não error', async () => {
    const buscar = buscarQue(autenticado(), response({}));
    const resultado = await new PluggyAggregator({ ...CREDENCIAL, buscar }).listarAccounts('item-1');

    expect(resultado.tipo).toBe('ok');
    if (resultado.tipo !== 'ok') return;
    expect(resultado.dados).toEqual([]);
  });

  it('a data de corte é enviada ao provedor', async () => {
    const buscar = buscarQue(autenticado(), response({ results: [] }));
    await new PluggyAggregator({ ...CREDENCIAL, buscar }).listarTransactions('item-1', new Date('2026-03-15T12:00:00Z'));

    expect(buscar.chamadas.at(-1)).toContain('from=2026-03-15');
  });
});
