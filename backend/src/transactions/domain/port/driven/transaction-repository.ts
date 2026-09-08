import type { Transaction } from '../../model/transaction';
import type { HolderId } from '../../model/holder';

// Porta de saida (driven). Quem implementa e detalhe da infraestrutura.
//
// Nao existe "listar tudo": o filtro por holder e da CONSULTA, nunca de um
// passo posterior em memory (RN-015). Uma porta que devolve tudo convida a
// filtrar depois — e filtrar depois ja vazou pelo log e pela metrica.
export interface RepositorioDeTransactions {
  listarDoHolder(holderId: HolderId): Promise<readonly Transaction[]>;

  /**
   * Persists transactions from a sync with dedup by (holderId, externalId)
   * (RN-008): the same external id and due date is stored once.
   */
  salvarSincronizados(lancamentos: readonly Transaction[]): Promise<void>;

  /** Deletes every transaction of a holder (RN-016, account deletion). */
  deleteByHolder(holderId: HolderId): Promise<void>;
}
