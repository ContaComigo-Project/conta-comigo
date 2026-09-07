import type { Lancamento } from '../../model/lancamento';

// Porta de saida (driven). Quem implementa e detalhe da infraestrutura.
export interface RepositorioDeLancamentos {
  listarTodos(): Promise<readonly Lancamento[]>;
}
