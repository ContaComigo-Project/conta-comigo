import type { Lancamento } from '../../model/lancamento';
import type { TitularId } from '../../model/titular';

// Porta de entrada: listar os lancamentos DO TITULAR. Filtro por periodo chega
// com RF-009 (HN-003).
export interface ListarLancamentos {
  executar(titularId: TitularId): Promise<readonly Lancamento[]>;
}
