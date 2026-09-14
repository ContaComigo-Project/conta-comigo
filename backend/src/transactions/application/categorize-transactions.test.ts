import { describe, expect, it } from 'vitest';
import type { Transaction } from '../domain/model/transaction';
import { holderId } from '../domain/model/holder';
import type { CategorySuggester } from '../domain/port/driven/category-suggester';
import { CategorizeTransactions } from './categorize-transactions';

const TITULAR = holderId('holder-a');

const lancamento = (id: string, description: string, amountInCents = -10_000, extra: Partial<Transaction> = {}): Transaction => ({
  id,
  holderId: TITULAR,
  description,
  readableDescription: description,
  category: null,
  categoryOrigin: null,
  amountInCents,
  dueDate: new Date('2026-01-15T14:30:00Z'),
  externalId: `ext-${id}`,
  ...extra,
});

class SugeridorEspiao implements CategorySuggester {
  lotes: readonly string[][] = [];

  constructor(private readonly resposta: Record<string, string> = {}) {}

  async sugerir(descricoes: readonly string[], _holder: string) {
    this.lotes = [...this.lotes, [...descricoes]];
    return this.resposta;
  }
}

describe('CategorizeTransactions — RF-011', () => {
  it('a regra resolve sem consultar o sugeridor', async () => {
    const sugeridor = new SugeridorEspiao();

    const resultado = await new CategorizeTransactions(sugeridor).executar([
      lancamento('1', 'Uber', -3_490),
      lancamento('2', 'Netflix', -5_590),
    ]);

    expect(resultado.map((l) => l.category)).toEqual(['transporte', 'lazer']);
    expect(resultado.every((l) => l.categoryOrigin === 'automatica')).toBe(true);
    expect(sugeridor.lotes).toHaveLength(0);
  });

  it('RNF-009 — o desconhecido vai em UM lote, com cada descrição uma vez só', async () => {
    const sugeridor = new SugeridorEspiao({ 'Loja Central': 'lazer', X9ZQ: 'saude' });

    const resultado = await new CategorizeTransactions(sugeridor).executar([
      lancamento('1', 'Loja Central'),
      lancamento('2', 'Loja Central'),
      lancamento('3', 'X9ZQ'),
      lancamento('4', 'Uber', -3_490),
    ]);

    expect(sugeridor.lotes).toHaveLength(1);
    expect(sugeridor.lotes[0].sort()).toEqual(['Loja Central', 'X9ZQ']);
    expect(resultado.map((l) => l.category)).toEqual(['lazer', 'lazer', 'saude', 'transporte']);
  });

  it('RF-011 — o que ninguém classificou fica não classificado, não "outros"', async () => {
    const resultado = await new CategorizeTransactions(new SugeridorEspiao({})).executar([
      lancamento('1', 'Loja Central'),
    ]);

    expect(resultado[0].category).toBeNull();
    expect(resultado[0].categoryOrigin).toBeNull();
  });

  it('RN-011 — lançamento com categoria manual não é tocado, nem entra no lote', async () => {
    const sugeridor = new SugeridorEspiao({ X9ZQ: 'saude' });
    const manual = lancamento('1', 'X9ZQ', -10_000, { category: 'lazer', categoryOrigin: 'manual' });

    const [resultado] = await new CategorizeTransactions(sugeridor).executar([manual]);

    expect(resultado.category).toBe('lazer');
    expect(resultado.categoryOrigin).toBe('manual');
    expect(sugeridor.lotes).toHaveLength(0);
  });

  it('RN-021 — sugeridor fora do ar não derruba: fica não classificado', async () => {
    const quebrado: CategorySuggester = {
      async sugerir() {
        throw new Error('provedor fora');
      },
    };

    const resultado = await new CategorizeTransactions(quebrado).executar([
      lancamento('1', 'Loja Central'),
      lancamento('2', 'Uber', -3_490),
    ]);

    expect(resultado.map((l) => l.category)).toEqual([null, 'transporte']);
  });

  it('a classificação não altera valor, data nem descrição', async () => {
    const original = lancamento('1', 'Uber', -3_490);

    const [resultado] = await new CategorizeTransactions(new SugeridorEspiao()).executar([original]);

    expect(resultado.amountInCents).toBe(original.amountInCents);
    expect(resultado.dueDate).toEqual(original.dueDate);
    expect(resultado.description).toBe(original.description);
  });
});
