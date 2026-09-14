import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { BudgetRepositoryPrisma } from './budget-repository-prisma';

// Teste de INTEGRACAO: fala com o PostgreSQL do docker compose. O que importa
// aqui e o que o adaptador em memoria nao consegue provar — a chave composta no
// banco e a barreira por titular na consulta (RN-015).
describe('BudgetRepositoryPrisma — limites no PostgreSQL real', () => {
  const repositorio = new BudgetRepositoryPrisma();

  beforeEach(async () => {
    await repositorio.limparTudo('holder-a');
    await repositorio.limparTudo('holder-b');
  });

  afterAll(async () => {
    await repositorio.encerrar();
  });

  it('o limite definido volta identico na consulta do mes', async () => {
    await repositorio.definir({ holderId: 'holder-a', month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });

    expect(await repositorio.listarDoMes('holder-a', '2026-01')).toEqual([
      { holderId: 'holder-a', month: '2026-01', category: 'alimentacao', limitInCents: 80_000 },
    ]);
  });

  it('RF-013 — definir de novo substitui a linha, sem duplicar', async () => {
    await repositorio.definir({ holderId: 'holder-a', month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });
    await repositorio.definir({ holderId: 'holder-a', month: '2026-01', category: 'alimentacao', limitInCents: 95_000 });

    const limites = await repositorio.listarDoMes('holder-a', '2026-01');
    expect(limites).toHaveLength(1);
    expect(limites[0].limitInCents).toBe(95_000);
  });

  it('RN-002 — remover apaga a linha: ausencia, e nao zero', async () => {
    await repositorio.definir({ holderId: 'holder-a', month: '2026-01', category: 'lazer', limitInCents: 20_000 });

    expect(await repositorio.remover('holder-a', '2026-01', 'lazer')).toBe(true);
    expect(await repositorio.listarDoMes('holder-a', '2026-01')).toEqual([]);
    expect(await repositorio.remover('holder-a', '2026-01', 'lazer')).toBe(false);
  });

  it('RN-015 — o limite de um titular nao aparece para outro', async () => {
    await repositorio.definir({ holderId: 'holder-a', month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });
    await repositorio.definir({ holderId: 'holder-b', month: '2026-01', category: 'alimentacao', limitInCents: 10_000 });

    const deA = await repositorio.listarDoMes('holder-a', '2026-01');
    const deB = await repositorio.listarDoMes('holder-b', '2026-01');

    expect(deA).toHaveLength(1);
    expect(deA[0].limitInCents).toBe(80_000);
    expect(deB[0].limitInCents).toBe(10_000);
  });

  it('RN-015 — remover o limite de outro titular nao apaga nada', async () => {
    await repositorio.definir({ holderId: 'holder-a', month: '2026-01', category: 'alimentacao', limitInCents: 80_000 });

    expect(await repositorio.remover('holder-b', '2026-01', 'alimentacao')).toBe(false);
    expect(await repositorio.listarDoMes('holder-a', '2026-01')).toHaveLength(1);
  });

  it('o mes faz parte da chave: janeiro e fevereiro nao se misturam', async () => {
    await repositorio.definir({ holderId: 'holder-a', month: '2026-01', category: 'lazer', limitInCents: 20_000 });
    await repositorio.definir({ holderId: 'holder-a', month: '2026-02', category: 'lazer', limitInCents: 30_000 });

    expect((await repositorio.listarDoMes('holder-a', '2026-01'))[0].limitInCents).toBe(20_000);
    expect((await repositorio.listarDoMes('holder-a', '2026-02'))[0].limitInCents).toBe(30_000);
  });
});
