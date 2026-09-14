// Limpeza semantica da descricao do lancamento (RF-010), como regra pura.
//
// RN-010 manda o original permanecer consultavel e o que nao for reconhecido
// permanecer intacto. Por isso toda regra aqui e conservadora: na duvida,
// devolve o texto como veio. Uma limpeza que apaga informacao e pior que
// nenhuma limpeza — a pessoa perde a unica pista que tinha.

// Estabelecimentos frequentes. A lista e curta de proposito: ela cobre o caso
// repetido, e o resto cai na IA (HN-004, passo 2) ou no original.
const CONHECIDOS: readonly (readonly [RegExp, string])[] = [
  [/\buber\b/i, 'Uber'],
  [/\bifood|\bifd\b/i, 'iFood'],
  [/\bnetflix\b/i, 'Netflix'],
  [/\bspotify\b/i, 'Spotify'],
  [/\bamazon\b/i, 'Amazon'],
  [/\bmercado\s*livre|mercadolivre|\bmercpago\b/i, 'Mercado Livre'],
  [/\b99app|\b99\s*taxi\b/i, '99'],
  [/\brappi\b/i, 'Rappi'],
];

// Prefixo de adquirente e de tipo de operacao. Aparecem coladas no nome do
// estabelecimento e nao dizem nada a quem le a fatura.
const PREFIXOS = /^(pag\s*\*|pg\s*\*|pagto\s+|tef\s+(compra\s+)?|compra\s+cartao\s+|deb\s+|cred\s+|pix\s+(enviado|recebido)\s+)/i;

// Sufixo de parcela ("04/12") e codigo numerico solto no fim.
const PARCELA = /\s+\d{1,2}\/\d{1,2}\s*$/;
const CODIGO_FINAL = /\s+[\d*#-]{4,}\s*$/;
// Ruido do proprio adquirente colado no fim: "HELP.UBER", "COM", "BR SERVICOS".
const RUIDO_FINAL = /\s+(help\.[a-z.]+|[a-z]+\.com(\.br)?|br\s+servicos|club|ltda|s\/?a|me)\s*$/i;

const MINUSCULAS = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'em', 'no', 'na']);

function comCaixaDeTitulo(texto: string): string {
  return texto
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, indice) =>
      indice > 0 && MINUSCULAS.has(palavra) ? palavra : palavra.charAt(0).toUpperCase() + palavra.slice(1),
    )
    .join(' ');
}

export function limparDescricao(original: string): string {
  for (const [padrao, nome] of CONHECIDOS) {
    if (padrao.test(original)) return nome;
  }

  let texto = original.replace(PREFIXOS, '');
  texto = texto.replace(PARCELA, '').replace(RUIDO_FINAL, '').replace(CODIGO_FINAL, '');
  texto = texto.replace(/[*]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // Limpou até não sobrar nada legível: melhor o texto cru do que uma linha
  // sem descrição (RN-010).
  if (texto === '' || !/[a-zà-ú]{3}/i.test(texto)) return original;

  return comCaixaDeTitulo(texto);
}

/**
 * Vale gastar uma chamada de IA nesta descricao? So quando o resultado
 * deterministico continua ilegivel: sigla curta, codigo, ou texto sem vogal
 * suficiente para formar palavra. Perguntar sobre "Mercado Central" seria
 * queimar cota (RNF-009) para confirmar o obvio.
 */
export function precisaDeAjuda(limpa: string): boolean {
  const texto = limpa.trim();
  if (texto === '') return false;
  if (/\d{4,}/.test(texto)) return true;

  const letras = texto.replace(/[^a-zà-ú]/gi, '');
  // Menos de tres letras nao forma palavra. "Uber" tem quatro e e perfeitamente
  // legivel — o corte precisa ficar abaixo do nome curto de verdade.
  if (letras.length < 3) return true;

  const vogais = (letras.match(/[aeiouà-ú]/gi) ?? []).length;
  return vogais / letras.length < 0.25;
}
