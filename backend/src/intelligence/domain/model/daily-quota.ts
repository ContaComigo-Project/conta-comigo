// O teto diario por pessoa (RNF-009), como regra pura.
//
// O dia e derivado do instante em UTC. Fuso local mudaria a hora da virada de
// maquina para maquina e, na pratica, daria a alguem um teto dobrado no dia da
// mudanca de horario.

export const TETO_DIARIO_PADRAO = 20;

export function diaDe(instante: Date): string {
  return instante.toISOString().slice(0, 10);
}

export function tetoConfigurado(bruto: string | undefined, padrao = TETO_DIARIO_PADRAO): number {
  const valor = Number(bruto);
  // Valor ausente, texto ou negativo cai no padrao: um teto invalido nao pode
  // virar "sem teto" por acidente — seria a forma mais cara de errar.
  return Number.isInteger(valor) && valor > 0 ? valor : padrao;
}

export function dentroDoTeto(usoAtual: number, teto: number): boolean {
  return usoAtual < teto;
}
