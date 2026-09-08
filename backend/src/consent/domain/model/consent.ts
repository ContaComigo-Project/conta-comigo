// Consent as a first-class record (HN-002). The explicit decision of a person
// to authorize an institution to provide data. No consent active = no sync and
// no display (RN-012); one active consent per institution per holder (RN-014).
//
// The aggregator credential is NEVER stored in clear: the persistence layer
// stores the ciphertext and this entity only carries the plain value during a
// use-case transaction (RNF-014).

export interface Consent {
  readonly id: string;
  readonly holderId: string;
  readonly institutionId: string;
  /** Identifier the provider gave to the holder-institution link (HT-011). */
  readonly connectionId: string;
  /** What the person authorized (e.g. "accounts", "transactions"). */
  readonly scope: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
  /** Aggregator credential, CIPHERED. The domain never sees the plain value. */
  readonly credentialCipher: string;
  readonly lastSyncAt: Date | null;
}

/** Active means not revoked AND not expired. Expired equals absent (RN-012). */
export function estaAtivo(consent: Consent, agora: Date): boolean {
  return consent.revokedAt === null && agora < consent.expiresAt;
}

/** Default consent lifetime: 90 days (product decision, recorded in HN-002). */
export const PRAZO_DO_CONSENTIMENTO_DIAS = 90;

export function novoConsent(params: {
  id: string;
  holderId: string;
  institutionId: string;
  connectionId: string;
  scope: string;
  credentialCipher: string;
  agora: Date;
}): Consent {
  const expiraEm = new Date(params.agora.getTime() + PRAZO_DO_CONSENTIMENTO_DIAS * 24 * 60 * 60_000);
  return {
    id: params.id,
    holderId: params.holderId,
    institutionId: params.institutionId,
    connectionId: params.connectionId,
    scope: params.scope,
    credentialCipher: params.credentialCipher,
    createdAt: params.agora,
    expiresAt: expiraEm,
    revokedAt: null,
    lastSyncAt: null,
  };
}