// Catalogo de categorias e classificacao por regra (RF-011).
//
// Os identificadores sao os mesmos que a web ja usa para escolher icone e cor
// (`frontend/src/data/presentation.ts`): inventar outro conjunto aqui obrigaria
// uma tabela de traducao na borda, sem ganho nenhum.

export const CATEGORIAS_VALIDAS = [
  'alimentacao',
  'transporte',
  'moradia',
  'saude',
  'lazer',
  'receita',
  'investimentos',
  'outros',
] as const;

export type Categoria = (typeof CATEGORIAS_VALIDAS)[number];

/** Quem classificou (RN-011). Manual prevalece e nao e sobrescrita. */
export type OrigemDaCategoria = 'automatica' | 'manual';

export function categoriaValida(valor: unknown): valor is Categoria {
  return typeof valor === 'string' && (CATEGORIAS_VALIDAS as readonly string[]).includes(valor);
}

// Termos por categoria. A busca e por PALAVRA INTEIRA: "uber" dentro de
// "Uberlandia" nao e corrida de aplicativo, e classificar por substring produz
// exatamente esse tipo de erro silencioso.
const TERMOS: readonly (readonly [Categoria, readonly string[]])[] = [
  ['alimentacao', ['ifood', 'mercado', 'supermercado', 'padaria', 'restaurante', 'lanchonete', 'hortifruti', 'acougue', 'rappi', 'pizzaria', 'cafe']],
  ['transporte', ['uber', '99', 'taxi', 'metro', 'onibus', 'combustivel', 'posto', 'estacionamento', 'pedagio', 'ipva']],
  ['moradia', ['aluguel', 'condominio', 'energia', 'luz', 'agua', 'gas', 'internet', 'iptu']],
  ['saude', ['farmacia', 'drogaria', 'clinica', 'hospital', 'laboratorio', 'plano de saude', 'dentista', 'psicologa', 'psicologo']],
  ['lazer', ['netflix', 'spotify', 'cinema', 'teatro', 'show', 'games', 'steam', 'disney', 'max', 'academia']],
  ['investimentos', ['rendimento', 'dividendo', 'aplicacao', 'resgate']],
];

const RECEITA = ['salario', 'transf recebida', 'pix recebido', 'pagamento recebido', 'reembolso'];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function contemPalavra(texto: string, termo: string): boolean {
  // O termo pode ter espaco ("plano de saude"), entao a fronteira e checada nas
  // pontas em vez de usar \b direto no meio da expressao.
  const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escapado}([^a-z0-9]|$)`).test(texto);
}

/**
 * Classifica pela descricao legivel e pelo sinal do valor. Devolve `null`
 * quando nao reconhece: RF-011 pede o estado explicito "nao classificado", e
 * "outros" seria um chute com cara de resposta.
 */
export function categorizarPorRegra(descricao: string, amountInCents: number): Categoria | null {
  const texto = normalizar(descricao);

  // Entrada de dinheiro: rendimento de aplicacao e investimento; o resto que
  // entra e receita. O sinal decide antes do termo porque "resgate" com valor
  // negativo nao e entrada nenhuma.
  if (amountInCents > 0) {
    for (const termo of TERMOS.find(([c]) => c === 'investimentos')?.[1] ?? []) {
      if (contemPalavra(texto, termo)) return 'investimentos';
    }
    if (RECEITA.some((termo) => contemPalavra(texto, termo))) return 'receita';
    return 'receita';
  }

  for (const [categoria, termos] of TERMOS) {
    if (categoria === 'investimentos') continue;
    if (termos.some((termo) => contemPalavra(texto, termo))) return categoria;
  }

  return null;
}
