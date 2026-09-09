import type { AiAdvisor } from '../../../intelligence/domain/port/driven/ai-advisor';
import type { DescriptionTranslator } from '../../domain/port/driven/description-translator';

// Adaptador do tradutor sobre a porta de IA de `HT-013`. Infraestrutura falando
// com a porta de outro contexto: o domínio de `transactions` conhece apenas
// `DescriptionTranslator` (ADR-001).
//
// O que sai daqui é texto de descrição e nada mais — nenhum valor, nenhuma data,
// nenhum identificador da pessoa (RN-019, RNF-015). O pedido inteiro passa pelo
// teto, pelo cache e pela guarda montados no módulo de `intelligence`.

const INSTRUCAO = [
  'Traduza cada descrição de lançamento bancário para o nome reconhecível do estabelecimento.',
  'Responda SOMENTE um JSON no formato {"original": "legível"}.',
  'Se não reconhecer uma descrição, repita o texto original como valor.',
  'Não invente valores, datas nem informação que não esteja na descrição.',
].join(' ');

export class AdvisorDescriptionTranslator implements DescriptionTranslator {
  constructor(private readonly advisor: AiAdvisor) {}

  async traduzir(descricoes: readonly string[], holder: string): Promise<Record<string, string>> {
    // O titular vai no pedido para o teto e o cache de HT-013 — e ele NAO entra
    // no prompt: quem e a pessoa nao muda a traducao (RNF-015).
    const resultado = await this.advisor.aconselhar({
      holder,
      tipo: 'descricao-legivel',
      pergunta: INSTRUCAO,
      dados: { descricoes: [...descricoes] },
    });

    // Falha, teto atingido ou resposta bloqueada pela guarda: o caso de uso
    // segue com a versão determinística (RN-021).
    if (resultado.tipo !== 'ok') return {};

    return this.mapaDe(resultado.dados.texto, descricoes);
  }

  /**
   * O modelo é fonte não confiável (RNF-017): a resposta só vira mapa se for
   * JSON de texto para texto, e só entram as chaves que realmente foram
   * perguntadas — nada de descrição inventada entrando na lista.
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
    for (const [original, legivel] of Object.entries(cru as Record<string, unknown>)) {
      if (!permitidas.has(original)) continue;
      if (typeof legivel !== 'string') continue;
      const limpo = legivel.trim();
      if (limpo !== '' && limpo.length <= 120) mapa[original] = limpo;
    }
    return mapa;
  }
}
