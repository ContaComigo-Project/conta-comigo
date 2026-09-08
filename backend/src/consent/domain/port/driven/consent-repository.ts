import type { Consent } from '../../model/consent';

// Outbound port of the consent context (ADR-001). The domain never knows
// Prisma; the repository lives in infrastructure/persistence/.

export interface ConsentRepository {
  save(consent: Consent): Promise<void>;

  /** The single active consent for an institution, or null (RN-014/RN-012). */
  findActiveByInstitution(holderId: string, institutionId: string, agora: Date): Promise<Consent | null>;

  listByHolder(holderId: string): Promise<readonly Consent[]>;

  /** Looks up a consent that BELONGS to the holder (RN-015). */
  findById(holderId: string, consentId: string): Promise<Consent | null>;

  updateLastSyncAt(consentId: string, agora: Date): Promise<void>;

  /** Marks the previous consent revoked on reconnection (RN-014). */
  revoke(consentId: string, agora: Date): Promise<void>;

  /** Definitively deletes consents whose scheduled deletion is due (RN-013). */
  purgeDue(agora: Date): Promise<number>;

  /** Deletes every consent of a holder (RN-016, account deletion). */
  deleteByHolder(holderId: string): Promise<void>;
}

export const TOKENS_CONSENT = {
  ConsentRepository: Symbol.for('consent/ConsentRepository'),
  CredentialCipher: Symbol.for('consent/CredentialCipher'),
  Identity: Symbol.for('consent/Identity'),
  ConnectInstitution: Symbol.for('consent/ConnectInstitution'),
  ListConnections: Symbol.for('consent/ListConnections'),
  SyncInstitution: Symbol.for('consent/SyncInstitution'),
  RevokeConsent: Symbol.for('consent/RevokeConsent'),
  DeleteAccount: Symbol.for('consent/DeleteAccount'),
} as const;