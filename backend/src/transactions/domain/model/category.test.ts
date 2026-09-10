import { describe, expect, it } from 'vitest';
import { CATEGORIAS_VALIDAS, categoriaValida, categorizarPorRegra } from './category';

// RF-011: todo lancamento recebe categoria ou o estado "nao classificado".
describe('categorizarPorRegra — RF-011', () => {
  it('classifica os casos frequentes de uma fatura', () => {
    expect(categorizarPorRegra('Uber', -3_490)).toBe('transporte');
    expect(categorizarPorRegra('99', -1_200)).toBe('transporte');
    expect(categorizarPorRegra('iFood', -5_600)).toBe('alimentacao');
    expect(categorizarPorRegra('Mercado Central', -21_850)).toBe('alimentacao');
    expect(categorizarPorRegra('Netflix', -5_590)).toBe('lazer');
    expect(categorizarPorRegra('Spotify', -2_190)).toBe('lazer');
    expect(categorizarPorRegra('Farmacia Sao Jorge', -8_900)).toBe('saude');
    expect(categorizarPorRegra('Aluguel Apartamento', -180_000)).toBe('moradia');
  });

  it('entrada de dinheiro e receita, independentemente da descricao', () => {
    expect(categorizarPorRegra('Transf Recebida', 850_000)).toBe('receita');
    expect(categorizarPorRegra('Salario', 500_000)).toBe('receita');
    expect(categorizarPorRegra('Credito Desconhecido Sem Termo', 50_000)).toBe('receita');
  });

  it('rendimento de aplicacao e investimento, nao receita de trabalho', () => {
    expect(categorizarPorRegra('Rendimento Poupanca', 3_870)).toBe('investimentos');
  });

  it('RF-011 — o que a regra nao reconhece fica NAO CLASSIFICADO, sem chute', () => {
    // "Outros" e uma categoria de verdade e poluiria o orcamento; o estado
    // explicito e null.
    expect(categorizarPorRegra('X9ZQ', -1_000)).toBeNull();
    expect(categorizarPorRegra('Loja Central', -4_000)).toBeNull();
  });

  it('nao confunde palavra dentro de outra', () => {
    // "farmacia" dentro de "Farmacia" sim; "uber" dentro de "Uberlandia" nao.
    expect(categorizarPorRegra('Padaria Uberlandia', -1_500)).not.toBe('transporte');
  });
});

describe('categoriaValida — RNF-017', () => {
  it('aceita so o que existe no catalogo', () => {
    for (const categoria of CATEGORIAS_VALIDAS) expect(categoriaValida(categoria)).toBe(true);
  });

  it('recusa valor inventado, vazio ou com caixa diferente', () => {
    expect(categoriaValida('viagens')).toBe(false);
    expect(categoriaValida('')).toBe(false);
    expect(categoriaValida('Transporte')).toBe(false);
    expect(categoriaValida(null)).toBe(false);
    expect(categoriaValida(42)).toBe(false);
  });
});
