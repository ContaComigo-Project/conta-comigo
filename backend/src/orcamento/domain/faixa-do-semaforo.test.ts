import { describe, expect, it } from 'vitest';
import { faixaDoSemaforo } from './faixa-do-semaforo';

// Casos de borda copiados do catalogo (REGRAS-DE-NEGOCIO.md, RN-001 e RN-002).
describe('RN-001 — faixa do semaforo', () => {
  const limite = 100_00; // R$ 100,00

  it('exatamente 70% e verde', () => {
    expect(faixaDoSemaforo(70_00, limite)).toBe('verde');
  });

  it('acima de 70% e amarela', () => {
    expect(faixaDoSemaforo(70_01, limite)).toBe('amarela');
  });

  it('exatamente 90% e amarela', () => {
    expect(faixaDoSemaforo(90_00, limite)).toBe('amarela');
  });

  it('90,01% e vermelha', () => {
    expect(faixaDoSemaforo(90_01, limite)).toBe('vermelha');
  });

  it('gasto zero e verde', () => {
    expect(faixaDoSemaforo(0, limite)).toBe('verde');
  });

  it('gasto acima do limite e vermelha (nao ha teto de 200%: RN-024 descartada)', () => {
    expect(faixaDoSemaforo(350_00, limite)).toBe('vermelha');
  });

  it('nao arredonda antes de comparar: 70,004% continua amarela', () => {
    // limite 100.000,00; gasto 70.004,00 -> 70,004%
    expect(faixaDoSemaforo(70_004_00, 100_000_00)).toBe('amarela');
  });
});

describe('RN-002 — categoria sem limite', () => {
  it('limite nulo e "sem-limite", nunca verde', () => {
    expect(faixaDoSemaforo(0, null)).toBe('sem-limite');
    expect(faixaDoSemaforo(500_00, null)).toBe('sem-limite');
  });

  it('limite zero tambem e "sem-limite" (evita divisao por zero e faixa falsa)', () => {
    expect(faixaDoSemaforo(10_00, 0)).toBe('sem-limite');
  });
});
