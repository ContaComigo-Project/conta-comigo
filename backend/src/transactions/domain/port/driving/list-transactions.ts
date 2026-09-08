import type { Transaction } from '../../model/transaction';
import type { HolderId } from '../../model/holder';

// Porta de input: listar os transactions DO TITULAR. Filtro por periodo chega
// com RF-009 (HN-003).
export interface ListarTransactions {
  executar(holderId: HolderId): Promise<readonly Transaction[]>;
}
