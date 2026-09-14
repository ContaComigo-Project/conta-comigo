import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from '../../domain/model/advice';
import { ChaveDeIaAusente, GeminiAdvisor } from './gemini-advisor';

const pedido: PedidoDeConselho = {
  holder: 'holder-a-identificador-secreto',
  tipo: 'diagnostico-do-mes',
  pergunta: 'como foi meu mes?',
  dados: { totalEmCentavos: 120_000, categorias: { mercado: 40_000 } },
};

function respostaDoGemini(texto: string): Response {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: texto }] } }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('GeminiAdvisor', () => {
  it('RNF-012 — sem chave, recusa operar em vez de tentar anonimamente', () => {
    expect(() => new GeminiAdvisor({ apiKey: '' })).toThrow(ChaveDeIaAusente);
  });

  it('monta a requisicao do provedor e devolve o texto da resposta', async () => {
    let url = '';
    let corpo: unknown = null;

    const advisor = new GeminiAdvisor({
      apiKey: 'chave-de-teste',
      buscar: async (entrada, init) => {
        url = String(entrada);
        corpo = JSON.parse(String(init?.body));
        return respostaDoGemini('seu mes fechou dentro do previsto');
      },
    });

    const resultado = await advisor.aconselhar(pedido);

    expect(url).toContain('generativelanguage.googleapis.com');
    expect(resultado.tipo === 'ok' && resultado.dados.texto).toBe('seu mes fechou dentro do previsto');
    expect(resultado.tipo === 'ok' && resultado.dados.origem).toBe('provedor');
    expect(corpo).toMatchObject({ contents: [{ parts: [{ text: expect.any(String) }] }] });
  });

  it('RNF-015 — o que sai para o provedor nao carrega a identidade da pessoa', async () => {
    let enviado = '';

    const advisor = new GeminiAdvisor({
      apiKey: 'chave-de-teste',
      buscar: async (_entrada, init) => {
        enviado = String(init?.body);
        return respostaDoGemini('ok');
      },
    });

    await advisor.aconselhar(pedido);

    expect(enviado).not.toContain('holder-a-identificador-secreto');
    expect(enviado).toContain('120000');
  });

  it('RNF-012 — a chave viaja no cabecalho, nunca na URL do log', async () => {
    let url = '';
    let cabecalhos: Record<string, string> = {};

    const advisor = new GeminiAdvisor({
      apiKey: 'chave-de-teste',
      buscar: async (entrada, init) => {
        url = String(entrada);
        cabecalhos = (init?.headers ?? {}) as Record<string, string>;
        return respostaDoGemini('ok');
      },
    });

    await advisor.aconselhar(pedido);

    expect(url).not.toContain('chave-de-teste');
    expect(cabecalhos['x-goog-api-key']).toBe('chave-de-teste');
  });

  it('401 do provedor vira credencial-invalida; 503 vira indisponivel', async () => {
    const comStatus = (status: number) =>
      new GeminiAdvisor({ apiKey: 'k', buscar: async () => new Response('', { status }) });

    const naoAutorizado = await comStatus(401).aconselhar(pedido);
    const foraDoAr = await comStatus(503).aconselhar(pedido);

    expect(naoAutorizado.tipo === 'falha' && naoAutorizado.motivo).toBe('credencial-invalida');
    expect(foraDoAr.tipo === 'falha' && foraDoAr.motivo).toBe('indisponivel');
  });

  it('resposta sem texto util vira resposta-invalida, nao um conselho vazio', async () => {
    const advisor = new GeminiAdvisor({
      apiKey: 'k',
      buscar: async () => new Response(JSON.stringify({ candidates: [] }), { status: 200 }),
    });

    const resultado = await advisor.aconselhar(pedido);

    expect(resultado.tipo === 'falha' && resultado.motivo).toBe('resposta-invalida');
  });
});
