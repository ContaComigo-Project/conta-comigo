// Falha do provedor de IA e VALOR DE RETORNO, nao excecao (RNF-005, RN-021).
//
// Mesmo desenho de aggregation-result.ts, e pelo mesmo motivo: um throw que
// sobe ate a borda esvazia a tela, e a regra e que o painel numerico continue
// funcionando quando a IA nao responde. Contexto separado de proposito — o
// dominio de agregacao nao conhece o de inteligencia (ADR-001).

export type MotivoDaFalhaDeIa =
  /** Rede, timeout, 5xx: pode responder na proxima. Vale nova tentativa. */
  | 'indisponivel'
  /** Chave errada, revogada ou sem cota no provedor. Insistir nao conserta. */
  | 'credencial-invalida'
  /** Teto diario da pessoa atingido (RNF-009). Nao e erro: e limite combinado. */
  | 'teto-atingido'
  /** O provedor respondeu, mas com algo que nao da para usar. */
  | 'resposta-invalida'
  /** A guarda de saida reprovou o texto (HT-014, RNF-017). */
  | 'resposta-bloqueada';

export interface FalhaDeIa {
  readonly tipo: 'falha';
  readonly motivo: MotivoDaFalhaDeIa;
  /** Texto para o log e para a tela. NUNCA carrega chave nem dado pessoal. */
  readonly detalhe: string;
}

export interface OkDeIa<T> {
  readonly tipo: 'ok';
  readonly dados: T;
}

export type ResultadoDeIa<T> = OkDeIa<T> | FalhaDeIa;

export const okDeIa = <T>(dados: T): OkDeIa<T> => ({ tipo: 'ok', dados });
export const falhaDeIa = (motivo: MotivoDaFalhaDeIa, detalhe: string): FalhaDeIa => ({
  tipo: 'falha',
  motivo,
  detalhe,
});

/** Só o transitorio merece nova tentativa (RNF-006). */
export const eTransitoriaNaIa = (motivo: MotivoDaFalhaDeIa) => motivo === 'indisponivel';
