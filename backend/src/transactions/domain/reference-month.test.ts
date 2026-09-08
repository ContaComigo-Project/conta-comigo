import { describe, expect, it } from 'vitest';
import { mesDeReferencia, mesmoMes } from './reference-month';

// RN-003 — mes de referencia = mes civil da data de competencia, fuso de Sao Paulo.
// Os instantes sao dados em UTC para o teste nao depender do fuso da maquina.
// Sao Paulo e UTC-3 (sem horario de verao desde 2019).
describe('RN-003 — mes de referencia no fuso de Sao Paulo', () => {
  it('31/01 as 23:59 em Sao Paulo e janeiro', () => {
    // 23:59 SP = 02:59 UTC do dia seguinte
    expect(mesDeReferencia(new Date('2026-02-01T02:59:00Z'))).toEqual({ ano: 2026, mes: 1 });
  });

  it('01/02 as 00:01 em Sao Paulo e fevereiro', () => {
    expect(mesDeReferencia(new Date('2026-02-01T03:01:00Z'))).toEqual({ ano: 2026, mes: 2 });
  });

  it('instante que ja e dia 1 em UTC mas ainda e dia 28 em Sao Paulo fica no mes anterior', () => {
    // 00:30 UTC de 01/03 = 21:30 SP de 28/02
    expect(mesDeReferencia(new Date('2026-03-01T00:30:00Z'))).toEqual({ ano: 2026, mes: 2 });
  });

  it('virada de ano: 31/12 as 22:00 SP e dezembro do ano anterior', () => {
    // 01:00 UTC de 01/01/2027 = 22:00 SP de 31/12/2026
    expect(mesDeReferencia(new Date('2027-01-01T01:00:00Z'))).toEqual({ ano: 2026, mes: 12 });
  });

  it('mesmoMes compara ano e mes', () => {
    expect(mesmoMes({ ano: 2026, mes: 1 }, { ano: 2026, mes: 1 })).toBe(true);
    expect(mesmoMes({ ano: 2026, mes: 1 }, { ano: 2025, mes: 1 })).toBe(false);
    expect(mesmoMes({ ano: 2026, mes: 1 }, { ano: 2026, mes: 2 })).toBe(false);
  });
});
