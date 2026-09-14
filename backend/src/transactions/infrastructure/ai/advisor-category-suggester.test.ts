import { describe, expect, it } from 'vitest';
import { falhaDeIa, okDeIa } from '../../../intelligence/domain/model/ai-result';
import type { AiAdvisor } from '../../../intelligence/domain/port/driven/ai-advisor';
import { AdvisorCategorySuggester } from './advisor-category-suggester';

const advisorQueResponde = (texto: string): AiAdvisor => ({
  async aconselhar() {
    return okDeIa({ texto, origem: 'provedor' as const });
  },
});

describe('AdvisorCategorySuggester — HN-005', () => {
  it('aceita a categoria do catalogo devolvida pelo modelo', async () => {
    const sugeridor = new AdvisorCategorySuggester(advisorQueResponde('{"Loja Central": "lazer"}'));

    expect(await sugeridor.sugerir(['Loja Central'], 'holder-a')).toEqual({ 'Loja Central': 'lazer' });
  });

  it('RNF-017 — categoria inventada e descartada: fica nao classificado', async () => {
    const sugeridor = new AdvisorCategorySuggester(advisorQueResponde('{"Loja Central": "viagens"}'));

    expect(await sugeridor.sugerir(['Loja Central'], 'holder-a')).toEqual({});
  });

  it('RNF-017 — descricao que ninguem perguntou nao entra', async () => {
    const sugeridor = new AdvisorCategorySuggester(
      advisorQueResponde('{"Loja Central": "lazer", "Outra Coisa": "saude"}'),
    );

    expect(await sugeridor.sugerir(['Loja Central'], 'holder-a')).toEqual({ 'Loja Central': 'lazer' });
  });

  it('RNF-017 — resposta que nao e JSON vira mapa vazio', async () => {
    const sugeridor = new AdvisorCategorySuggester(advisorQueResponde('nao sei classificar'));

    expect(await sugeridor.sugerir(['Loja Central'], 'holder-a')).toEqual({});
  });

  it('RN-021 — teto atingido devolve mapa vazio, nao excecao', async () => {
    const semCota: AiAdvisor = { aconselhar: async () => falhaDeIa('teto-atingido', 'limite diario') };

    expect(await new AdvisorCategorySuggester(semCota).sugerir(['Loja Central'], 'holder-a')).toEqual({});
  });
});
