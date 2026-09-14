import { describe, expect, it } from 'vitest';
import { LIMITE_MAXIMO_EM_CENTAVOS, mesValido, validarLimite } from './monthly-limit';

describe('mesValido — RF-013', () => {
  it('aceita o mes de referencia no formato AAAA-MM', () => {
    expect(mesValido('2026-01')).toBe(true);
    expect(mesValido('2026-12')).toBe(true);
  });

  it('recusa formato ambiguo, mes inexistente e texto', () => {
    expect(mesValido('2026-1')).toBe(false);
    expect(mesValido('2026-13')).toBe(false);
    expect(mesValido('2026-00')).toBe(false);
    expect(mesValido('01-2026')).toBe(false);
    expect(mesValido('janeiro')).toBe(false);
    expect(mesValido('')).toBe(false);
  });
});

describe('validarLimite — RN-006, RN-002', () => {
  it('aceita valor inteiro em centavos', () => {
    expect(validarLimite(80_000)).toEqual({ valido: true });
    // Zero e um limite de verdade ("quero gastar zero"), diferente de ausencia:
    // remover o limite e outra operacao (RN-002).
    expect(validarLimite(0)).toEqual({ valido: true });
  });

  it('recusa valor fracionario: dinheiro e inteiro em centavos (RN-006)', () => {
    expect(validarLimite(80_000.5).valido).toBe(false);
  });

  it('recusa negativo, NaN e infinito', () => {
    expect(validarLimite(-1).valido).toBe(false);
    expect(validarLimite(Number.NaN).valido).toBe(false);
    expect(validarLimite(Number.POSITIVE_INFINITY).valido).toBe(false);
  });

  it('recusa acima do teto: um limite absurdo e erro de digitacao, nao intencao', () => {
    expect(validarLimite(LIMITE_MAXIMO_EM_CENTAVOS).valido).toBe(true);
    expect(validarLimite(LIMITE_MAXIMO_EM_CENTAVOS + 1).valido).toBe(false);
  });
});
