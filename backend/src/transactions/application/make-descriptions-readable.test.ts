import { describe, expect, it } from 'vitest';
import type { Transaction } from '../domain/model/transaction';
import { holderId } from '../domain/model/holder';
import type { DescriptionTranslator } from '../domain/port/driven/description-translator';
import { MakeDescriptionsReadable } from './make-descriptions-readable';

const TITULAR = holderId('holder-a');

const lancamento = (id: string, description: string): Transaction => ({
  id,
  holderId: TITULAR,
  description,
  readableDescription: null,
  amountInCents: -12_345,
  dueDate: new Date('2026-01-15T14:30:00Z'),
  externalId: `ext-${id}`,
});

class TradutorEspiao implements DescriptionTranslator {
  lotes: readonly string[][] = [];

  constructor(private readonly resposta: Record<string, string> = {}) {}

  async traduzir(descricoes: readonly string[], _holder: string) {
    this.lotes = [...this.lotes, [...descricoes]];
    return this.resposta;
  }
}

describe('MakeDescriptionsReadable — RF-010', () => {
  it('aplica as regras determinísticas sem consultar o tradutor', async () => {
    const tradutor = new TradutorEspiao();
    const caso = new MakeDescriptionsReadable(tradutor);

    const resultado = await caso.executar([
      lancamento('1', 'PAG*MERCADO CENTRAL 04/12'),
      lancamento('2', 'NETFLIX.COM'),
    ]);

    expect(resultado.map((l) => l.readableDescription)).toEqual(['Mercado Central', 'Netflix']);
    expect(tradutor.lotes).toHaveLength(0);
  });

  it('RNF-009 — o que sobra vai em UMA chamada, com cada descrição uma vez só', async () => {
    const tradutor = new TradutorEspiao({ X9ZQ: 'Farmácia São Jorge', 'LJ 4021 CP': 'Loja de Departamento' });
    const caso = new MakeDescriptionsReadable(tradutor);

    const resultado = await caso.executar([
      lancamento('1', 'X9ZQ'),
      lancamento('2', 'X9ZQ'),
      lancamento('3', 'LJ 4021 CP'),
      lancamento('4', 'NETFLIX.COM'),
    ]);

    expect(tradutor.lotes).toHaveLength(1);
    expect(tradutor.lotes[0].sort()).toEqual(['LJ 4021 CP', 'X9ZQ']);
    expect(resultado.map((l) => l.readableDescription)).toEqual([
      'Farmácia São Jorge',
      'Farmácia São Jorge',
      'Loja de Departamento',
      'Netflix',
    ]);
  });

  it('RN-010 — o que ninguém reconheceu fica com o texto original', async () => {
    const caso = new MakeDescriptionsReadable(new TradutorEspiao({}));

    const [resultado] = await caso.executar([lancamento('1', 'X9ZQ')]);

    expect(resultado.readableDescription).toBe('X9ZQ');
    expect(resultado.description).toBe('X9ZQ');
  });

  it('RNF-005 / RN-021 — tradutor fora do ar não derruba: fica a versão determinística', async () => {
    const quebrado: DescriptionTranslator = {
      async traduzir() {
        throw new Error('provedor fora');
      },
    };
    const caso = new MakeDescriptionsReadable(quebrado);

    const resultado = await caso.executar([lancamento('1', 'X9ZQ'), lancamento('2', 'PAG*MERCADO CENTRAL')]);

    expect(resultado.map((l) => l.readableDescription)).toEqual(['X9ZQ', 'Mercado Central']);
  });

  it('RN-010 — valor, data e identificador não mudam', async () => {
    const caso = new MakeDescriptionsReadable(new TradutorEspiao());
    const original = lancamento('1', 'PAG*MERCADO CENTRAL');

    const [resultado] = await caso.executar([original]);

    expect(resultado.amountInCents).toBe(original.amountInCents);
    expect(resultado.dueDate).toEqual(original.dueDate);
    expect(resultado.externalId).toBe(original.externalId);
    expect(resultado.description).toBe(original.description);
  });

  it('lote grande é cortado no limite: o resto fica para a próxima sincronização', async () => {
    const tradutor = new TradutorEspiao();
    const caso = new MakeDescriptionsReadable(tradutor, 5);

    await caso.executar(Array.from({ length: 12 }, (_, i) => lancamento(String(i), `X9Z${i}`)));

    expect(tradutor.lotes).toHaveLength(1);
    expect(tradutor.lotes[0]).toHaveLength(5);
  });

  it('nenhum lançamento para traduzir: nenhuma chamada', async () => {
    const tradutor = new TradutorEspiao();

    await new MakeDescriptionsReadable(tradutor).executar([]);

    expect(tradutor.lotes).toHaveLength(0);
  });
});
