import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { AdviceCachePrisma } from './advice-cache-prisma';
import { UsageCounterPrisma } from './usage-counter-prisma';

// Teste de INTEGRACAO: fala com o PostgreSQL do docker compose. O ponto é que
// teto e cache precisam sobreviver ao reinício do processo — um adaptador em
// memória passaria nos unitários e falharia no primeiro deploy (RNF-009,
// RNF-010).
describe('teto e cache de IA no PostgreSQL real', () => {
  const contador = new UsageCounterPrisma();
  const cache = new AdviceCachePrisma();

  beforeEach(async () => {
    await contador.limparTudo();
    await cache.limparTudo();
  });

  afterAll(async () => {
    await contador.encerrar();
    await cache.encerrar();
  });

  it('o uso do dia começa em zero e cresce a cada registro', async () => {
    expect(await contador.usoDoDia('holder-a', '2026-09-08')).toBe(0);

    await contador.registrarUso('holder-a', '2026-09-08');
    await contador.registrarUso('holder-a', '2026-09-08');

    expect(await contador.usoDoDia('holder-a', '2026-09-08')).toBe(2);
  });

  it('a contagem é por titular e por dia, sem misturar', async () => {
    await contador.registrarUso('holder-a', '2026-09-08');
    await contador.registrarUso('holder-b', '2026-09-08');
    await contador.registrarUso('holder-a', '2026-09-09');

    expect(await contador.usoDoDia('holder-a', '2026-09-08')).toBe(1);
    expect(await contador.usoDoDia('holder-b', '2026-09-08')).toBe(1);
    expect(await contador.usoDoDia('holder-a', '2026-09-09')).toBe(1);
  });

  it('registros concorrentes não se perdem: o incremento acontece no banco', async () => {
    await Promise.all(
      Array.from({ length: 10 }, () => contador.registrarUso('holder-a', '2026-09-08')),
    );

    expect(await contador.usoDoDia('holder-a', '2026-09-08')).toBe(10);
  });

  it('o conselho guardado volta marcado como cache', async () => {
    expect(await cache.buscar('chave-1')).toBeNull();

    await cache.guardar('chave-1', { texto: 'mês dentro do previsto', origem: 'provedor' });
    const guardado = await cache.buscar('chave-1');

    expect(guardado).toEqual({ texto: 'mês dentro do previsto', origem: 'cache' });
  });
});
