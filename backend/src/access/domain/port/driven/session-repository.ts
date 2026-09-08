import type { HolderId } from '../../../../transactions/domain/model/holder';

// O refresh e guardado em HASH: se o banco vazar, os refresh nao sao utilizaveis.
export interface Session {
  readonly id: string;
  readonly holderId: HolderId;
  readonly refreshTokenHash: string;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
}

export interface SessionRepository {
  criar(session: Session): Promise<void>;
  porHashDoRefresh(hash: string): Promise<Session | null>;
  revogar(id: string, quando: Date): Promise<void>;
}
