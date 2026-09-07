export interface RepositorioDeOrcamento {
  percentualGasto(categoria: string): Promise<number>;
}
