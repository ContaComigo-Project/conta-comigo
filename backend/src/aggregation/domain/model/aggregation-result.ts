// Falha de provedor externo e VALOR DE RETORNO, nao excecao.
//
// RNF-005 exige que o provedor fora degrade a tela em vez de derruba-la. Uma
// excecao que sobe ate a borda faz o oposto: o caso de uso nao tem como decidir
// "mostro o que ja esta no banco". Com resultado tipado, ele e obrigado a
// decidir — o compilador nao deixa ignorar o caso de falha.

export type MotivoDaFalha =
  /** Rede, timeout, 5xx: o provedor pode responder na proxima. Vale nova tentativa. */
  | 'indisponivel'
  /** Credencial errada ou revogada. Insistir nao conserta e gasta cota. */
  | 'credencial-invalida'
  /** A conexao ou o recurso nao existe do lado do provedor. */
  | 'nao-encontrado';

export interface Falha {
  readonly tipo: 'falha';
  readonly motivo: MotivoDaFalha;
  /** Mensagem para log e diagnostico. NUNCA carrega credencial (RNF-015). */
  readonly detalhe: string;
}

export interface Ok<T> {
  readonly tipo: 'ok';
  readonly dados: T;
}

export type ResultDaAgregacao<T> = Ok<T> | Falha;

export const ok = <T>(dados: T): Ok<T> => ({ tipo: 'ok', dados });
export const falha = (motivo: MotivoDaFalha, detalhe: string): Falha => ({ tipo: 'falha', motivo, detalhe });

/** Transitorio vale nova tentativa; permanente, nao (RNF-006). */
export const eTransitorio = (motivo: MotivoDaFalha) => motivo === 'indisponivel';
