// Porta do tradutor de descricao (HN-004). O caso de uso NAO conhece IA: conhece
// "algo que traduz descricao". Hoje o adaptador fala com a porta de
// `intelligence`; amanha poderia ser um dicionario comprado, e o dominio nao
// mudaria (RNF-020).
export interface DescriptionTranslator {
  /**
   * Recebe as descricoes que as regras nao resolveram e devolve um mapa
   * original -> legivel. Mapa incompleto e resposta valida: o que nao voltar
   * fica com a versao deterministica (RN-010).
   */
  traduzir(descricoes: readonly string[], holder: string): Promise<Record<string, string>>;
}
