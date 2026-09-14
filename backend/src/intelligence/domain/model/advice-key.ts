import type { PedidoDeConselho } from './advice';

// A chave do cache (RNF-010). Duas decisoes moram aqui:
//
// 1. O titular entra na chave. Sem isso, a resposta sobre os dados de uma
//    pessoa seria servida a outra que fizesse a mesma pergunta (RN-015).
// 2. Os DADOS entram na chave, nao so a pergunta. Cache que ignora o dado
//    serve resposta velha depois de uma sincronizacao — pior que nao ter cache,
//    porque erra em silencio.
//
// A serializacao ordena as chaves: { a: 1, b: 2 } e { b: 2, a: 1 } sao os
// mesmos dados e precisam da mesma chave.

function estavel(valor: unknown): string {
  if (valor === null || typeof valor !== 'object') return JSON.stringify(valor) ?? 'null';
  if (Array.isArray(valor)) return `[${valor.map(estavel).join(',')}]`;
  const pares = Object.entries(valor as Record<string, unknown>)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([chave, conteudo]) => `${JSON.stringify(chave)}:${estavel(conteudo)}`);
  return `{${pares.join(',')}}`;
}

/**
 * Impressao dos dados: uma soma de verificacao curta e deterministica.
 * Nao precisa ser criptografica — precisa mudar quando o dado muda. FNV-1a
 * cabe em uma funcao e nao traz dependencia.
 */
export function impressaoDe(dados: unknown): string {
  const texto = estavel(dados);
  let hash = 0x811c9dc5;
  for (let i = 0; i < texto.length; i += 1) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function chaveDoConselho(pedido: PedidoDeConselho): string {
  return [pedido.holder, pedido.tipo, impressaoDe(pedido.pergunta), impressaoDe(pedido.dados)].join(':');
}
