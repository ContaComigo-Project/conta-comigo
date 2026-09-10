// O pedido de conselho. Repare no que NAO existe aqui: nome, e-mail, id de
// conta bancaria. O modelo recebe numeros e categorias — quem e a pessoa nao
// muda a resposta e nao tem por que sair do sistema (RNF-015).

/** Identificador do titular. Usado para teto e cache, NUNCA enviado ao provedor. */
export type HolderRef = string;

export type TipoDeConselho =
  /** Diagnostico do mes a partir do consolidado (HN-009). */
  | 'diagnostico-do-mes'
  /** Limpeza semantica de descricao de lancamento (HN-004). */
  | 'descricao-legivel'
  /** Sugestao de categoria (HN-005). */
  | 'categoria'
  /** Pergunta livre do chat educativo (HN-010). */
  | 'pergunta-livre';

export interface PedidoDeConselho {
  readonly holder: HolderRef;
  readonly tipo: TipoDeConselho;
  /** O que se quer saber, ja em texto. Sem identidade. */
  readonly pergunta: string;
  /** Os numeros que o modelo interpreta. Valores, nunca identificadores. */
  readonly dados: Readonly<Record<string, unknown>>;
}

export interface Conselho {
  readonly texto: string;
  /** De onde veio: ajuda o teste e o log a distinguir cache de chamada nova. */
  readonly origem: 'provedor' | 'cache' | 'contingencia';
  /** Quando `origem === 'contingencia'`, o motivo da falha do provedor (ex.: alta demanda). */
  readonly falhaDetalhe?: string;
}
