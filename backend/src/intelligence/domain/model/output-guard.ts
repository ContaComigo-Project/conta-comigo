// A saida do modelo e ENTRADA NAO CONFIAVEL (RNF-017). Estas regras sao o
// exame que todo texto atravessa antes de chegar a uma tela, e vivem no dominio
// porque sao regra do produto, nao detalhe do provedor.

export type MotivoDoBloqueio =
  /** Vazio, gigante ou com bloco de codigo: nao e conselho (RNF-017). */
  | 'formato-invalido'
  /** Citou valor monetario que o consolidado nao tem (RN-019). */
  | 'valor-divergente'
  /** Recomendou produto financeiro, investimento, credito ou instituicao (RN-017). */
  | 'recomendacao-de-produto';

export type Veredito =
  | { readonly aprovado: true }
  | { readonly aprovado: false; readonly motivo: MotivoDoBloqueio; readonly amostra: string };

const LIMITE_DE_TAMANHO = 4_000;
const TAMANHO_DA_AMOSTRA = 80;

// Produtos financeiros. FALAR deles é educação (o usuário pode perguntar como
// funciona um consórcio); o que RN-017 proíbe é RECOMENDAR. Por isso um termo
// de produto só bloqueia junto de um verbo de recomendação (ver examinarSaida).
const TERMOS_DE_PRODUTO = [
  'cdb',
  'lci',
  'lca',
  'tesouro direto',
  'tesouro selic',
  'fundo de investimento',
  'previdencia privada',
  'corretora',
  'acoes',
  'criptomoeda',
  'bitcoin',
  'emprestimo',
  'financiamento',
  'consorcio',
];

// Citar produto de uma INSTITUIÇÃO específica é promoção — bloqueia mesmo sem
// verbo ("o cartão de crédito do Banco X tem cashback").
const TERMOS_INSTITUCIONAIS = [
  'cartao de credito do',
  'conta no banco',
  'conta na corretora',
  'recomendo o banco',
];

// Dinheiro tem marca: ou vem com R$, ou vem com duas casas decimais. Numero solto
// e contagem, mes ou porcentagem — comparar tudo transformaria "3 contas
// conectadas" em bloqueio, e uma guarda que bloqueia tudo e desligada na
// primeira semana. O limite e declarado de proposito: valor inventado escrito
// como inteiro sem R$ passa, e isso esta registrado na entrega.
const MONETARIO = /R\$\s*([\d.,]+)|(?<![\d,.%])(\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{2}|\d+\.\d{2})(?!\s*%)/gi;

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Converte "1.284,32", "1284,32" ou "1284.32" em 128432 centavos. */
function paraCentavos(bruto: string): number | null {
  const limpo = bruto.trim().replace(/\s/g, '');
  // Formato brasileiro: ponto e milhar, virgula e decimal.
  const emPonto = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const valor = Number(emPonto);
  return Number.isFinite(valor) ? Math.round(valor * 100) : null;
}

// A resposta que chega a uma tela é TEXTO SIMPLES: nada de markdown bruto
// (`**`, `###`, `---`, listas, código) nem de emojis. É regra do produto — o
// painel renderiza texto, não é um editor de markdown. O limite de tamanho
// mantém o bloco legível na tela (o diagnóstico não pode virar um ensaio).
const LIMITE_DE_TEXTO = 1000;
const EMOJIS = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu;
const MARKDOWN = /```[\s\S]*?```|`|[*_~>]|^#+\s*|^\s*[-+]\s+|^-{3,}$|^=+$/gm;

/** Remove marcação e emojis, normaliza espaços e aplica o limite de leitura. */
export function sanitizarTexto(texto: string, limite = LIMITE_DE_TEXTO): string {
  let limpo = texto.replace(MARKDOWN, '').replace(EMOJIS, '');
  limpo = limpo.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (limpo.length > limite) limpo = `${limpo.slice(0, limite).trimEnd()}…`;
  return limpo;
}

export function valoresMonetariosDe(texto: string): number[] {
  const encontrados: number[] = [];
  for (const achado of texto.matchAll(MONETARIO)) {
    const bruto = achado[1] ?? achado[2];
    if (!bruto) continue;
    const centavos = paraCentavos(bruto);
    if (centavos !== null) encontrados.push(centavos);
  }
  return encontrados;
}

/**
 * Todo numero que aparece nos dados do pedido, em centavos e tambem como valor
 * inteiro. O consolidado guarda centavos; um dado que ja venha em reais nao
 * pode virar bloqueio por causa da unidade.
 */
export function valoresPermitidos(dados: unknown, acumulado = new Set<number>()): Set<number> {
  if (typeof dados === 'number' && Number.isFinite(dados)) {
    acumulado.add(Math.round(Math.abs(dados)));
    acumulado.add(Math.round(Math.abs(dados) * 100));
  } else if (Array.isArray(dados)) {
    for (const item of dados) valoresPermitidos(item, acumulado);
  } else if (dados !== null && typeof dados === 'object') {
    for (const valor of Object.values(dados as Record<string, unknown>)) valoresPermitidos(valor, acumulado);
  }
  return acumulado;
}

function amostraDe(texto: string): string {
  const limpo = texto.trim().replace(/\s+/g, ' ');
  return limpo.length <= TAMANHO_DA_AMOSTRA ? limpo : `${limpo.slice(0, TAMANHO_DA_AMOSTRA - 1)}…`;
}

/**
 * Os tres exames, na ordem em que fazem sentido: formato primeiro (texto vazio
 * nao tem valor nem termo a examinar), depois produto, depois numero.
 */
function contemTermoProibido(textoNormalizado: string, termo: string): boolean {
  // Termos de produto exigem fronteira de palavra para evitar falsos positivos
  // em palavras legítimas do português (ex: "movimentações" contém o sufixo "acoes").
  const regex = new RegExp(`(^|[^a-z0-9])${termo}([^a-z0-9]|$)`, 'i');
  return regex.test(textoNormalizado);
}

// Verbos que transformam a menção de um produto em RECOMENDAÇÃO (RN-017).
// Explicar o produto que o usuário perguntou é educação; "recomendo/vale a
// pena/invista" é recomendação, mesmo quando o assunto foi solicitado.
// Apenas RECOMENDAÇÕES DIRETAS. Expressões ambíguas ("vale a pena", "pode ser
// uma boa", "considere") aparecem naturalmente em explicações educativas e
// bloqueá-las silenciava a própria conversa que o produto quer estimular.
const VERBOS_DE_RECOMENDACAO = [
  'recomendo', 'recomendamos', 'recomendaria', 'sugiro', 'sugerimos', 'aconselho', 'aconselhamos',
  'invista', 'invistam', 'investir em', 'contrate', 'contratar um', 'aplicar em',
  'abrir uma conta', 'abra uma conta', 'adquirir', 'recomendo o banco',
];

function contemVerboDeRecomendacao(textoNormalizado: string): boolean {
  return VERBOS_DE_RECOMENDACAO.some((verbo) => contemTermoProibido(textoNormalizado, verbo));
}

/**
 * Valores que o próprio usuário informou (pergunta + histórico). São legítimos:
 * RN-019 impede o modelo de INVENTAR número, não de repetir a meta que a pessoa
 * deu. Reconhece "350mil", "2 milhões" e o formato "R$ 350.000,00".
 */
export function valoresInformadosPeloUsuario(contexto: string): number[] {
  const valores = valoresMonetariosDe(contexto);
  for (const achado of contexto.matchAll(/(\d+(?:[.,]\d+)?)\s*(mil|milh(?:ao|ões|oes))/gi)) {
    const base = Number(achado[1].replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(base)) continue;
    const reais = base * (/^mil$/i.test(achado[2]) ? 1_000 : 1_000_000);
    valores.push(Math.round(reais));
    valores.push(Math.round(reais * 100));
  }
  return valores;
}

export function examinarSaida(texto: string, dados: unknown, pergunta = '', checarValoresDivergentes = true): Veredito {
  const bloquear = (motivo: MotivoDoBloqueio): Veredito => ({ aprovado: false, motivo, amostra: amostraDe(texto) });

  if (texto.trim() === '' || texto.length > LIMITE_DE_TAMANHO || texto.includes('```')) {
    return bloquear('formato-invalido');
  }

  const normalizado = normalizar(texto);
  // Promoção de produto de uma instituição específica: bloqueia sempre.
  if (TERMOS_INSTITUCIONAIS.some((termo) => contemTermoProibido(normalizado, termo))) {
    return bloquear('recomendacao-de-produto');
  }
  // Recomendação = produto financeiro citado JUNTO de um verbo de recomendação.
  // Explicar ou perguntar a preferência (financiar? consórcio? à vista?) não é
  // recomendar — a conversa educativa continua.
  const temProduto = TERMOS_DE_PRODUTO.some((termo) => contemTermoProibido(normalizado, termo));
  if (temProduto && contemVerboDeRecomendacao(normalizado)) {
    return bloquear('recomendacao-de-produto');
  }

  // RN-019: o DIAGNÓSTICO só interpreta números do consolidado — todo valor
  // citado precisa estar no painel (ou ser a meta informada pelo usuário). No
  // chat, o plano pode CALCULAR valores novos (ex.: reserva mensal) sem inventar
  // os dados da pessoa — bloquear o cálculo silenciaria o próprio propósito.
  if (checarValoresDivergentes) {
    const permitidos = valoresPermitidos(dados);
    for (const valor of valoresInformadosPeloUsuario(pergunta)) permitidos.add(valor);
    if (valoresMonetariosDe(texto).some((valor) => !permitidos.has(valor))) {
      return bloquear('valor-divergente');
    }
  }

  return { aprovado: true };
}
