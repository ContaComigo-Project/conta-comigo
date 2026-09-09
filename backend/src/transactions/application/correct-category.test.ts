import { describe, expect, it } from 'vitest';
import { holderId } from '../domain/model/holder';
import type { Transaction } from '../domain/model/transaction';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';
import { CorrectCategory } from './correct-category';

const A = holderId('holder-a');
const B = holderId('holder-b');

const lancamento = (id: string, dono = A): Transaction => ({
  id,
  holderId: dono,
  description: 'PAG*MERCADO CENTRAL',
  readableDescription: 'Mercado Central',
  category: 'alimentacao',
  categoryOrigin: 'automatica',
  amountInCents: -21_850,
  dueDate: new Date('2026-01-15T14:30:00Z'),
  externalId: 'ext-1',
});

// Repositorio falso construido a partir da PORTA: teste de application/ nao
// importa infrastructure/ (regra provada pelo gate de fronteiras).
class RepositorioFalso implements RepositorioDeTransactions {
  salvos: Transaction[] = [];

  constructor(private linhas: Transaction[]) {}

  async salvar(transaction: Transaction): Promise<void> {
    this.salvos.push(transaction);
    this.linhas = this.linhas.map((l) => (l.id === transaction.id ? transaction : l));
  }

  async listarDoHolder(holder: string): Promise<readonly Transaction[]> {
    return this.linhas.filter((l) => l.holderId === holder);
  }

  async buscarDoHolder(holder: string, id: string): Promise<Transaction | null> {
    return this.linhas.find((l) => l.holderId === holder && l.id === id) ?? null;
  }

  async salvarSincronizados(): Promise<void> {}

  async deleteByHolder(): Promise<void> {}
}

describe('CorrectCategory — RF-012, RN-011, RN-015', () => {
  it('grava a categoria escolhida e marca a origem como manual', async () => {
    const repositorio = new RepositorioFalso([lancamento('1')]);

    const resultado = await new CorrectCategory(repositorio).executar({
      holderId: A,
      transactionId: '1',
      category: 'lazer',
    });

    expect(resultado.tipo).toBe('corrigida');
    expect(repositorio.salvos[0]).toMatchObject({ category: 'lazer', categoryOrigin: 'manual' });
  });

  it('RN-015 — lançamento de outro titular responde não encontrado e nada é gravado', async () => {
    const repositorio = new RepositorioFalso([lancamento('1', B)]);

    const resultado = await new CorrectCategory(repositorio).executar({
      holderId: A,
      transactionId: '1',
      category: 'lazer',
    });

    expect(resultado.tipo).toBe('nao-encontrado');
    expect(repositorio.salvos).toHaveLength(0);
  });

  it('categoria fora do catálogo é recusada sem gravar', async () => {
    const repositorio = new RepositorioFalso([lancamento('1')]);

    const resultado = await new CorrectCategory(repositorio).executar({
      holderId: A,
      transactionId: '1',
      category: 'viagens',
    });

    expect(resultado.tipo).toBe('categoria-invalida');
    expect(repositorio.salvos).toHaveLength(0);
  });

  it('corrigir de novo continua sendo manual: só outra correção muda o valor', async () => {
    const repositorio = new RepositorioFalso([lancamento('1')]);
    const caso = new CorrectCategory(repositorio);

    await caso.executar({ holderId: A, transactionId: '1', category: 'lazer' });
    await caso.executar({ holderId: A, transactionId: '1', category: 'saude' });

    expect(repositorio.salvos.at(-1)).toMatchObject({ category: 'saude', categoryOrigin: 'manual' });
  });

  it('a correção não altera valor, data nem descrição', async () => {
    const original = lancamento('1');
    const repositorio = new RepositorioFalso([original]);

    await new CorrectCategory(repositorio).executar({ holderId: A, transactionId: '1', category: 'lazer' });

    expect(repositorio.salvos[0]).toMatchObject({
      amountInCents: original.amountInCents,
      dueDate: original.dueDate,
      description: original.description,
      readableDescription: original.readableDescription,
    });
  });
});
