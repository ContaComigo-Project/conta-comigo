import { describe, expect, it } from 'vitest';
import type { LimiteMensal } from '../domain/model/monthly-limit';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import { ListMonthlyLimits } from './list-monthly-limits';
import { RemoveMonthlyLimit } from './remove-monthly-limit';
import { SetMonthlyLimit } from './set-monthly-limit';

const A = 'holder-a';
const B = 'holder-b';

// Fake construido a partir da PORTA: teste de application/ nao importa
// infrastructure/ (o gate de fronteiras reprova, e reprovou a primeira versao
// deste arquivo). A chave e a mesma do banco: (titular, mes, categoria).
class RepositorioFalso implements BudgetRepository {
  private readonly limites = new Map<string, LimiteMensal>();

  private chave(holderId: string, month: string, category: string) {
    return `${holderId}:${month}:${category}`;
  }

  async definir(limite: LimiteMensal): Promise<void> {
    this.limites.set(this.chave(limite.holderId, limite.month, limite.category), limite);
  }

  async remover(holderId: string, month: string, category: string): Promise<boolean> {
    return this.limites.delete(this.chave(holderId, month, category));
  }

  async listarDoMes(holderId: string, month: string): Promise<readonly LimiteMensal[]> {
    return [...this.limites.values()].filter((l) => l.holderId === holderId && l.month === month);
  }
}

function casos() {
  const repositorio = new RepositorioFalso();
  return {
    repositorio,
    definir: new SetMonthlyLimit(repositorio),
    remover: new RemoveMonthlyLimit(repositorio),
    listar: new ListMonthlyLimits(repositorio),
  };
}

describe('SetMonthlyLimit — RF-013', () => {
  it('grava o limite e ele volta na consulta do mesmo mês', async () => {
    const { definir, listar } = casos();

    const resultado = await definir.executar({ holderId: A, month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });
    const lista = await listar.executar({ holderId: A, month: '2026-01' });

    expect(resultado.tipo).toBe('definido');
    expect(lista.tipo === 'ok' && lista.limites).toEqual([
      { holderId: A, month: '2026-01', category: 'alimentacao', limitInCents: 80_000 },
    ]);
  });

  it('definir de novo SUBSTITUI, sem duplicar', async () => {
    const { definir, listar } = casos();

    await definir.executar({ holderId: A, month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });
    await definir.executar({ holderId: A, month: '2026-01', category: 'alimentacao', limitInCents: 95_000 });
    const lista = await listar.executar({ holderId: A, month: '2026-01' });

    expect(lista.tipo === 'ok' && lista.limites).toHaveLength(1);
    expect(lista.tipo === 'ok' && lista.limites[0].limitInCents).toBe(95_000);
  });

  it('o mês faz parte da chave: janeiro não vaza para fevereiro', async () => {
    const { definir, listar } = casos();

    await definir.executar({ holderId: A, month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });
    const fevereiro = await listar.executar({ holderId: A, month: '2026-02' });

    expect(fevereiro.tipo === 'ok' && fevereiro.limites).toEqual([]);
  });

  it('recusa mês inválido, categoria fora do catálogo e valor inválido, sem gravar', async () => {
    const { definir, repositorio } = casos();

    const mes = await definir.executar({ holderId: A, month: '2026-13', category: 'alimentacao', limitInCents: 1 });
    const categoria = await definir.executar({ holderId: A, month: '2026-01', category: 'viagens', limitInCents: 1 });
    const valor = await definir.executar({ holderId: A, month: '2026-01', category: 'alimentacao', limitInCents: -5 });

    expect([mes.tipo, categoria.tipo, valor.tipo]).toEqual(['invalido', 'invalido', 'invalido']);
    expect(await repositorio.listarDoMes(A, '2026-01')).toEqual([]);
  });
});

describe('RemoveMonthlyLimit — RN-002', () => {
  it('remover volta ao estado sem limite: a linha deixa de existir', async () => {
    const { definir, remover, listar } = casos();
    await definir.executar({ holderId: A, month: '2026-01', category: 'lazer', limitInCents: 20_000 });

    const resultado = await remover.executar({ holderId: A, month: '2026-01', category: 'lazer' });
    const lista = await listar.executar({ holderId: A, month: '2026-01' });

    expect(resultado.tipo).toBe('removido');
    expect(lista.tipo === 'ok' && lista.limites).toEqual([]);
  });

  it('remover o que não existe responde não encontrado, sem erro', async () => {
    const { remover } = casos();

    expect((await remover.executar({ holderId: A, month: '2026-01', category: 'lazer' })).tipo).toBe('nao-encontrado');
  });

  it('RN-002 — zero é um limite de verdade, e não a ausência dele', async () => {
    const { definir, listar } = casos();

    await definir.executar({ holderId: A, month: '2026-01', category: 'lazer', limitInCents: 0 });
    const lista = await listar.executar({ holderId: A, month: '2026-01' });

    expect(lista.tipo === 'ok' && lista.limites[0].limitInCents).toBe(0);
  });
});

describe('ListMonthlyLimits — RN-015', () => {
  it('o limite de um titular nunca aparece para outro', async () => {
    const { definir, listar } = casos();
    await definir.executar({ holderId: A, month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });

    const deB = await listar.executar({ holderId: B, month: '2026-01' });

    expect(deB.tipo === 'ok' && deB.limites).toEqual([]);
  });

  it('mês inválido é recusado antes de consultar', async () => {
    expect((await casos().listar.executar({ holderId: A, month: 'janeiro' })).tipo).toBe('invalido');
  });
});
