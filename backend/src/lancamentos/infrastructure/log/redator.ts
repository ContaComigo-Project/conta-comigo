// RNF-015 — nenhum dado financeiro ou pessoal aparece em log.
//
// O vazamento tipico nao e alguem logar a senha de proposito: e
// `logger.error(err, { lancamento })`, que serializa o objeto inteiro. O redator
// roda na borda do log e substitui, por NOME DE CAMPO, o valor de tudo que for
// sensivel — antes de virar texto.
//
// Por nome de campo, e nao por regex no texto final, porque o texto ja perdeu a
// estrutura: "8740" pode ser um valor em centavos ou um numero de pagina.

export const CAMPOS_SENSIVEIS = [
  'descricao',
  'descricaoOriginal',
  'estabelecimento',
  'valorEmCentavos',
  'saldoEmCentavos',
  'totalEmCentavos',
  'limiteEmCentavos',
  'gastoEmCentavos',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'senha',
  'password',
  'email',
  'cpf',
  'documento',
] as const;

export const MARCA = '[redigido]';

const sensiveis = new Set<string>(CAMPOS_SENSIVEIS.map((c) => c.toLowerCase()));

/**
 * Devolve uma copia segura para log. O que sobrevive: identificador do recurso,
 * identificador do titular, nome da operacao, data, duracao e resultado — o
 * suficiente para investigar sem expor a pessoa.
 */
export function redigir(valor: unknown, profundidade = 0): unknown {
  if (profundidade > 10) return MARCA; // ciclo ou estrutura absurda: corta
  if (valor === null || typeof valor !== 'object') return valor;
  if (valor instanceof Date) return valor.toISOString();
  if (Array.isArray(valor)) return valor.map((item) => redigir(item, profundidade + 1));

  const saida: Record<string, unknown> = {};
  for (const [chave, conteudo] of Object.entries(valor as Record<string, unknown>)) {
    saida[chave] = sensiveis.has(chave.toLowerCase()) ? MARCA : redigir(conteudo, profundidade + 1);
  }
  return saida;
}
