// Porta do sugeridor de categoria (HN-005). O caso de uso nao conhece IA:
// conhece "algo que sugere categoria" (RNF-020).
export interface CategorySuggester {
  /**
   * Recebe as descricoes que a regra nao classificou e devolve um mapa
   * descricao -> categoria. Mapa incompleto e resposta valida: o que nao voltar
   * fica NAO CLASSIFICADO (RF-011), nunca chutado.
   */
  sugerir(descricoes: readonly string[], holder: string): Promise<Record<string, string>>;
}
