// RN-003 — o mes de referencia de um lancamento e o mes civil da sua data de
// competencia, no fuso de Sao Paulo.
export interface MesDeReferencia {
  readonly ano: number;
  /** 1 = janeiro ... 12 = dezembro. */
  readonly mes: number;
}

const FUSO = 'America/Sao_Paulo';

// Intl e TypeScript/ECMAScript puro: resolve o fuso sem biblioteca externa,
// o que mantem domain/ sem dependencia (ADR-001). Node 24 embute o ICU completo.
const formatador = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, year: 'numeric', month: 'numeric' });

export function mesDeReferencia(data: Date): MesDeReferencia {
  const partes = formatador.formatToParts(data);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  return { ano: valor('year'), mes: valor('month') };
}

export function mesmoMes(a: MesDeReferencia, b: MesDeReferencia): boolean {
  return a.ano === b.ano && a.mes === b.mes;
}
