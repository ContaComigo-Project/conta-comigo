import type { ExternalAccount } from '../../model/external-account';
import type { HolderId } from '../../model/holder';

// Outbound port of the persisted external accounts (HN-003). Always scoped by
// holder (RN-015).

export interface ExternalAccountRepository {
  /** Saves the accounts from a sync, replacing the holder's snapshot (RN-008). */
  salvarSincronizadas(contas: readonly ExternalAccount[], holderId: HolderId): Promise<void>;

  listarDoHolder(holderId: HolderId): Promise<readonly ExternalAccount[]>;
}