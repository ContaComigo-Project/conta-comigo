import { CATEGORIAS_VALIDAS, categoriaValida } from '../../domain/model/category';
import type { AiAdvisor } from '../../../intelligence/domain/port/driven/ai-advisor';
import type { CategorySuggester } from '../../domain/port/driven/category-suggester';

// Adaptador do sugeridor sobre a porta de IA de HT-013. Sai descricao, entra
// categoria — nenhum valor, nenhuma data, nenhuma identidade (RNF-015).

const INSTRUCAO = [
  'Classifique cada descricao de lancamento em UMA categoria.',
  `Categorias permitidas: ${CATEGORIAS_VALIDAS.join(', ')}.`,
  'Responda SOMENTE um JSON no formato {"descricao": "categoria"}.',
  'Se nao tiver certeza, omita a descricao em vez de chutar.',
].join(' ');

export class AdvisorCategorySuggester implements CategorySuggester {
  constructor(private readonly advisor: AiAdvisor) {}

  async sugerir(descricoes: readonly string[], holder: string): Promise<Record<string, string>> {
    const resultado = await this.advisor.aconselhar({
      holder,
      tipo: 'categoria',
      pergunta: INSTRUCAO,
      dados: { descricoes: [...descricoes] },
    });

    if (resultado.tipo !== 'ok') return {};

    return this.mapaDe(resultado.dados.texto, descricoes);
  }

  /**
   * RNF-017: a saida do modelo e entrada nao confiavel. So entram descricoes
   * que foram perguntadas e categorias que existem no catalogo — categoria
   * inventada vira "nao classificado" (RF-011), nao um rotulo novo na tela.
   */
  private mapaDe(texto: string, perguntadas: readonly string[]): Record<string, string> {
    const inicio = texto.indexOf('{');
    const fim = texto.lastIndexOf('}');
    if (inicio < 0 || fim <= inicio) return {};

    let cru: unknown;
    try {
      cru = JSON.parse(texto.slice(inicio, fim + 1));
    } catch {
      return {};
    }
    if (cru === null || typeof cru !== 'object' || Array.isArray(cru)) return {};

    const permitidas = new Set(perguntadas);
    const mapa: Record<string, string> = {};
    for (const [descricao, categoria] of Object.entries(cru as Record<string, unknown>)) {
      if (permitidas.has(descricao) && categoriaValida(categoria)) mapa[descricao] = categoria;
    }
    return mapa;
  }
}
