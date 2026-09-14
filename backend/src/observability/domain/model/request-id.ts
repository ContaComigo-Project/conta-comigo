// Correlacao de requisicao como valor do dominio (RNF-008). E o fio que liga o
// que a pessoa viu na tela a linha que o log registrou.
//
// Vem do cliente quando o cabecalho x-request-id existe, e e gerado quando nao
// existe. Serve SO para correlacionar: nunca para autorizar, porque o cliente
// escolhe o valor.
export type RequestId = string & { readonly __marca: 'RequestId' };

const LIMITE = 128;

export function requestId(valor: string): RequestId {
  // Corta o que nao serve como identificador: caractere de controle quebraria a
  // linha JSON, e um valor gigante enviado de fora inflaria todo o log.
  const limpo = valor.replace(/[^\w.:-]/g, '').slice(0, LIMITE);
  return (limpo === '' ? 'sem-correlacao' : limpo) as RequestId;
}
