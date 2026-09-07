import type { Lancamento } from '../../model/lancamento';

// Porta de entrada: listar os lancamentos conhecidos. Filtro por periodo chega
// com RF-009 (HN-003); aqui e o minimo que o contrato precisa para existir.
export interface ListarLancamentos {
  executar(): Promise<readonly Lancamento[]>;
}
