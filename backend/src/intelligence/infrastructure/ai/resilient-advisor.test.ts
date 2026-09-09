import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from '../../domain/model/advice';
import { falhaDeIa, okDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';
import { POLITICA_DE_IA_PADRAO, ResilientAdvisor } from './resilient-advisor';

const pedido: PedidoDeConselho = {
  holder: 'holder-a',
  tipo: 'diagnostico-do-mes',
  pergunta: 'como foi meu mes?',
  dados: {},
};

// RNF-006 (limite de espera e nova tentativa controlada) e RNF-005 / RN-021
// (provedor fora degrada, nao derruba).
describe('ResilientAdvisor — RNF-005, RNF-006', () => {
  it('a politica padrao respeita o limite declarado: 10 s e 2 novas tentativas', () => {
    expect(POLITICA_DE_IA_PADRAO.limiteEmMs).toBeLessThanOrEqual(10_000);
    expect(POLITICA_DE_IA_PADRAO.novasTentativas).toBeLessThanOrEqual(2);
  });

  it('repete falha transitoria e devolve o acerto da segunda tentativa', async () => {
    let chamadas = 0;
    const instavel: AiAdvisor = {
      async aconselhar() {
        chamadas += 1;
        return chamadas === 1
          ? falhaDeIa('indisponivel', 'timeout do provedor')
          : okDeIa({ texto: 'consegui', origem: 'provedor' as const });
      },
    };

    const resultado = await new ResilientAdvisor(instavel, {
      limiteEmMs: 1_000,
      novasTentativas: 2,
      esperaBaseEmMs: 1,
    }).aconselhar(pedido);

    expect(chamadas).toBe(2);
    expect(resultado.tipo === 'ok' && resultado.dados.texto).toBe('consegui');
  });

  it('nao repete falha permanente: insistir com chave invalida so gasta cota', async () => {
    let chamadas = 0;
    const semChave: AiAdvisor = {
      async aconselhar() {
        chamadas += 1;
        return falhaDeIa('credencial-invalida', 'chave recusada');
      },
    };

    const resultado = await new ResilientAdvisor(semChave, {
      limiteEmMs: 1_000,
      novasTentativas: 2,
      esperaBaseEmMs: 1,
    }).aconselhar(pedido);

    expect(chamadas).toBe(1);
    expect(resultado.tipo === 'falha' && resultado.motivo).toBe('credencial-invalida');
  });

  it('provedor que nao responde vira falha tratada, nunca excecao (RN-021)', async () => {
    const travado: AiAdvisor = { aconselhar: () => new Promise(() => {}) };

    const resultado = await new ResilientAdvisor(travado, {
      limiteEmMs: 20,
      novasTentativas: 1,
      esperaBaseEmMs: 1,
    }).aconselhar(pedido);

    expect(resultado.tipo).toBe('falha');
    expect(resultado.tipo === 'falha' && resultado.motivo).toBe('indisponivel');
  });

  it('excecao do adaptador tambem vira falha: nada escapa para o caso de uso', async () => {
    const explosivo: AiAdvisor = {
      async aconselhar() {
        throw new Error('socket fechado');
      },
    };

    const resultado = await new ResilientAdvisor(explosivo, {
      limiteEmMs: 50,
      novasTentativas: 0,
      esperaBaseEmMs: 1,
    }).aconselhar(pedido);

    expect(resultado.tipo).toBe('falha');
  });
});
