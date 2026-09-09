import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from '../../../intelligence/domain/model/advice';
import { falhaDeIa, okDeIa } from '../../../intelligence/domain/model/ai-result';
import type { AiAdvisor } from '../../../intelligence/domain/port/driven/ai-advisor';
import { AdvisorDescriptionTranslator } from './advisor-description-translator';

const advisorQueResponde = (texto: string, capturar?: (p: PedidoDeConselho) => void): AiAdvisor => ({
  async aconselhar(pedido) {
    capturar?.(pedido);
    return okDeIa({ texto, origem: 'provedor' as const });
  },
});

describe('AdvisorDescriptionTranslator — HN-004', () => {
  it('traduz a partir do JSON devolvido pelo modelo', async () => {
    const tradutor = new AdvisorDescriptionTranslator(
      advisorQueResponde('{"X9ZQ": "Farmácia São Jorge", "LJ 4021": "Loja Central"}'),
    );

    expect(await tradutor.traduzir(['X9ZQ', 'LJ 4021'], 'holder-a')).toEqual({
      'X9ZQ': 'Farmácia São Jorge',
      'LJ 4021': 'Loja Central',
    });
  });

  it('aceita JSON cercado de conversa, que e como um modelo costuma responder', async () => {
    const tradutor = new AdvisorDescriptionTranslator(
      advisorQueResponde('Claro! Aqui esta:\n{"X9ZQ": "Farmácia São Jorge"}\nEspero ter ajudado.'),
    );

    expect(await tradutor.traduzir(['X9ZQ'], 'holder-a')).toEqual({ 'X9ZQ': 'Farmácia São Jorge' });
  });

  it('RNF-017 — descarta chave que ninguem perguntou e valor que nao e texto', async () => {
    const tradutor = new AdvisorDescriptionTranslator(
      advisorQueResponde('{"X9ZQ": "Farmácia", "NAO PERGUNTADA": "Qualquer", "OUTRA": 42}'),
    );

    expect(await tradutor.traduzir(['X9ZQ'], 'holder-a')).toEqual({ 'X9ZQ': 'Farmácia' });
  });

  it('RNF-017 — resposta que nao e JSON vira mapa vazio, nao excecao', async () => {
    const tradutor = new AdvisorDescriptionTranslator(advisorQueResponde('nao consegui traduzir'));

    expect(await tradutor.traduzir(['X9ZQ'], 'holder-a')).toEqual({});
  });

  it('RN-021 — teto atingido ou provedor fora devolve mapa vazio', async () => {
    const semCota: AiAdvisor = { aconselhar: async () => falhaDeIa('teto-atingido', 'limite diario') };

    expect(await new AdvisorDescriptionTranslator(semCota).traduzir(['X9ZQ'], 'holder-a')).toEqual({});
  });

  it('RN-019 / RNF-015 — o pedido leva descricao e nada mais', async () => {
    let enviado: PedidoDeConselho | null = null;
    const tradutor = new AdvisorDescriptionTranslator(
      advisorQueResponde('{}', (pedido) => {
        enviado = pedido;
      }),
    );

    await tradutor.traduzir(['X9ZQ'], 'holder-a');

    expect(enviado!.holder).toBe('holder-a');
    expect(enviado!.tipo).toBe('descricao-legivel');
    expect(enviado!.dados).toEqual({ descricoes: ['X9ZQ'] });
    expect(JSON.stringify(enviado!.dados)).not.toMatch(/\d{3,}/);
  });
});
