// Forma minima do que o adaptador HTTP usa da requisicao e da resposta.
//
// Nao importamos os tipos do express: seriam uma dependencia nova so para
// tipar quatro campos, e o Nest ja isola o servidor concreto. O que importa
// aqui e o formato, e ele e estavel.
export type RequisicaoHttp = {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
};

export type RespostaHttp = {
  statusCode: number;
  setHeader(nome: string, valor: string): void;
  status(codigo: number): RespostaHttp;
  json(corpo: unknown): unknown;
};

export type ProximoPasso = () => void;
