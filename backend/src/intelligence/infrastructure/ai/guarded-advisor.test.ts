import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from '../../domain/model/advice';
import { okDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';
import { AdviceCacheEmMemoria } from '../persistence/advice-cache-memory';
import { CachedAdvisor } from './cached-advisor';
import { GuardedAdvisor } from './guarded-advisor';

const pedido: PedidoDeConselho = {
  holder: 'holder-a',
  tipo: 'diagnostico-do-mes',
  pergunta: 'como foi meu mes?',
  dados: { totalEmCentavos: 128_432 },
};

const provedorQueResponde = (texto: string): AiAdvisor => ({
  async aconselhar() {
    return okDeIa({ texto, origem: 'provedor' as const });
  },
});

// RNF-017: a saida do modelo e tratada como entrada nao confiavel. O provedor
// simulado aqui e "adulterado" de proposito — e exatamente o cenario que o
// requisito pede.
describe('GuardedAdvisor — RNF-017', () => {
  it('deixa passar a resposta coerente com o consolidado', async () => {
    const advisor = new GuardedAdvisor(provedorQueResponde('Voce gastou R$ 1.284,32 no mes.'));

    const resultado = await advisor.aconselhar(pedido);

    expect(resultado.tipo).toBe('ok');
  });

  it('RN-019 — bloqueia o valor que o painel nao tem, sem lancar excecao', async () => {
    const advisor = new GuardedAdvisor(provedorQueResponde('Voce gastou cerca de R$ 1.300,00.'));

    const resultado = await advisor.aconselhar(pedido);

    expect(resultado.tipo).toBe('falha');
    expect(resultado.tipo === 'falha' && resultado.motivo).toBe('resposta-bloqueada');
    // A mensagem serve a uma pessoa, e nao repete o numero inventado.
    expect(resultado.tipo === 'falha' && resultado.detalhe).not.toContain('1.300');
  });

  it('RN-017 — bloqueia recomendacao de produto financeiro', async () => {
    const advisor = new GuardedAdvisor(provedorQueResponde('Invista em CDB para render mais.'));

    const resultado = await advisor.aconselhar(pedido);

    expect(resultado.tipo === 'falha' && resultado.motivo).toBe('resposta-bloqueada');
  });

  it('RNF-017 — o bloqueio e registrado com motivo e amostra curta, nao com o texto inteiro', async () => {
    const registrados: { motivo: string; amostra: string }[] = [];
    const advisor = new GuardedAdvisor(
      provedorQueResponde('Voce gastou cerca de R$ 1.300,00 e ' + 'muito texto '.repeat(30)),
      { bloqueio: (motivo, amostra) => registrados.push({ motivo, amostra }) },
    );

    await advisor.aconselhar(pedido);

    expect(registrados).toHaveLength(1);
    expect(registrados[0].motivo).toBe('valor-divergente');
    expect(registrados[0].amostra.length).toBeLessThanOrEqual(80);
  });

  it('falha do provedor atravessa sem virar bloqueio: os motivos nao se confundem', async () => {
    const foraDoAr: AiAdvisor = {
      aconselhar: async () => ({ tipo: 'falha', motivo: 'indisponivel', detalhe: 'provedor fora' }),
    };

    const resultado = await new GuardedAdvisor(foraDoAr).aconselhar(pedido);

    expect(resultado.tipo === 'falha' && resultado.motivo).toBe('indisponivel');
  });

  it('resposta bloqueada nao entra no cache: a guarda fica ABAIXO dele na pilha', async () => {
    let chamadas = 0;
    const adulterado: AiAdvisor = {
      async aconselhar() {
        chamadas += 1;
        return okDeIa({ texto: 'Voce gastou cerca de R$ 1.300,00.', origem: 'provedor' as const });
      },
    };

    const pilha = new CachedAdvisor(new GuardedAdvisor(adulterado), new AdviceCacheEmMemoria());

    const primeira = await pilha.aconselhar(pedido);
    const segunda = await pilha.aconselhar(pedido);

    expect(primeira.tipo).toBe('falha');
    expect(segunda.tipo).toBe('falha');
    // Duas chamadas: nada foi guardado. Se a guarda estivesse acima do cache, a
    // resposta reprovada teria sido cacheada na primeira passagem.
    expect(chamadas).toBe(2);
  });
});
