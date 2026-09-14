import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from '../../domain/model/advice';
import { okDeIa, falhaDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';
import { AdviceCacheEmMemoria } from '../persistence/advice-cache-memory';
import { CachedAdvisor } from './cached-advisor';

const pedido = (extra: Partial<PedidoDeConselho> = {}): PedidoDeConselho => ({
  holder: 'holder-a',
  tipo: 'diagnostico-do-mes',
  pergunta: 'como foi meu mes?',
  dados: { totalEmCentavos: 120_000, categorias: { mercado: 40_000 } },
  ...extra,
});

class ContadorDeChamadas implements AiAdvisor {
  chamadas = 0;

  constructor(private readonly resposta = 'gastou mais com mercado') {}

  async aconselhar() {
    this.chamadas += 1;
    return okDeIa({ texto: this.resposta, origem: 'provedor' as const });
  }
}

// RNF-010: resposta equivalente nao e paga duas vezes.
describe('CachedAdvisor — RNF-010', () => {
  it('a mesma pergunta sobre os mesmos dados chama o provedor uma unica vez', async () => {
    const provedor = new ContadorDeChamadas();
    const advisor = new CachedAdvisor(provedor, new AdviceCacheEmMemoria());

    const primeira = await advisor.aconselhar(pedido());
    const segunda = await advisor.aconselhar(pedido());

    expect(provedor.chamadas).toBe(1);
    expect(primeira.tipo === 'ok' && primeira.dados.origem).toBe('provedor');
    expect(segunda.tipo === 'ok' && segunda.dados.origem).toBe('cache');
    expect(segunda.tipo === 'ok' && segunda.dados.texto).toBe('gastou mais com mercado');
  });

  it('dado novo invalida o cache: sincronizou, pergunta de novo', async () => {
    const provedor = new ContadorDeChamadas();
    const advisor = new CachedAdvisor(provedor, new AdviceCacheEmMemoria());

    await advisor.aconselhar(pedido());
    await advisor.aconselhar(pedido({ dados: { totalEmCentavos: 130_000, categorias: { mercado: 40_000 } } }));

    expect(provedor.chamadas).toBe(2);
  });

  it('RN-015 — o cache de um titular nao serve outro', async () => {
    const provedor = new ContadorDeChamadas();
    const advisor = new CachedAdvisor(provedor, new AdviceCacheEmMemoria());

    await advisor.aconselhar(pedido());
    await advisor.aconselhar(pedido({ holder: 'holder-b' }));

    expect(provedor.chamadas).toBe(2);
  });

  it('falha nao entra no cache: o proximo pedido tenta de novo', async () => {
    let chamadas = 0;
    const instavel: AiAdvisor = {
      async aconselhar() {
        chamadas += 1;
        return chamadas === 1
          ? falhaDeIa('indisponivel', 'provedor fora')
          : okDeIa({ texto: 'agora foi', origem: 'provedor' as const });
      },
    };
    const advisor = new CachedAdvisor(instavel, new AdviceCacheEmMemoria());

    const primeira = await advisor.aconselhar(pedido());
    const segunda = await advisor.aconselhar(pedido());

    expect(primeira.tipo).toBe('falha');
    expect(segunda.tipo === 'ok' && segunda.dados.texto).toBe('agora foi');
    expect(chamadas).toBe(2);
  });
});
