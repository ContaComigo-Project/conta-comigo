// O que o aggregator devolve, traduzido para o vocabulario do dominio. Nenhum
// campo do provedor vaza para ca: se o Pluggy renomear um atributo, muda o
// adaptador, nao isto (RNF-020).

export type TipoDeAccountExterna = 'corrente' | 'poupanca' | 'cartao-de-credito';

export interface AccountExterna {
  readonly idExterno: string;
  readonly instituicao: string;
  readonly tipo: TipoDeAccountExterna;
  /** Em centavos, como todo valor do sistema (RN-006). */
  readonly saldoEmCentavos: number;
}

export interface TransactionExterno {
  readonly idExterno: string;
  readonly idDaAccountExterna: string;
  /** Descricao crua do provedor. A versao legivel e RF-010 (HN-004). */
  readonly descriptionOriginal: string;
  readonly amountInCents: number;
  readonly dueDate: Date;
}
