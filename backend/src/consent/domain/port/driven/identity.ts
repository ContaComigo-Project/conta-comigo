import type { HolderId } from '../../../../transactions/domain/model/holder';

// Who is asking (same port as the transactions context). The consent controller
// resolves the holder from the access token and never sees header/token.
export interface Identity {
  holderAtual(): HolderId | null;
}