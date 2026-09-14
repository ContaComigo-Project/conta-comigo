// O limite mensal por categoria (RF-013), como valor do dominio.
//
// A chave e (titular, mes, categoria). O mes e valor EXPLICITO, no formato
// AAAA-MM: derivar do relogio do servidor faria o mesmo pedido cair em meses
// diferentes conforme o fuso de quem chama.

export interface LimiteMensal {
  readonly holderId: string;
  /** Mes de referencia no formato AAAA-MM. */
  readonly month: string;
  readonly category: string;
  /** Valor em CENTAVOS, inteiro (RN-006). */
  readonly limitInCents: number;
}

/** Um trilhao de centavos: acima disso e erro de digitacao, nao intencao. */
export const LIMITE_MAXIMO_EM_CENTAVOS = 1_000_000_000_00;

const MES = /^\d{4}-(0[1-9]|1[0-2])$/;

export function mesValido(valor: unknown): valor is string {
  return typeof valor === 'string' && MES.test(valor);
}

export type Validacao = { readonly valido: true } | { readonly valido: false; readonly motivo: string };

export function validarLimite(valorEmCentavos: number): Validacao {
  if (!Number.isInteger(valorEmCentavos)) {
    // RN-006: dinheiro e inteiro em centavos. Aceitar fracionario aqui empurraria
    // o erro de ponto flutuante para toda soma futura.
    return { valido: false, motivo: 'o limite deve ser um numero inteiro de centavos' };
  }
  if (valorEmCentavos < 0) return { valido: false, motivo: 'o limite nao pode ser negativo' };
  if (valorEmCentavos > LIMITE_MAXIMO_EM_CENTAVOS) {
    return { valido: false, motivo: 'o limite excede o maximo permitido' };
  }
  return { valido: true };
}
