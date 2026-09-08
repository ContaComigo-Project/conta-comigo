import { ConsentDTO } from '@contacomigo/contract';
import { estaAtivo, type Consent } from '../../domain/model/consent';

// Maps the domain Consent to the transport DTO (HT-017: number vs formatting
// decisions live on the edge; status is derived from the entity).
export function paraConsentDTO(consent: Consent, agora: Date): ConsentDTO {
  const status = consent.revokedAt !== null ? 'revogado' : estaAtivo(consent, agora) ? 'ativo' : 'expirado';
  return {
    id: consent.id,
    institutionId: consent.institutionId,
    scope: consent.scope,
    status,
    createdAt: consent.createdAt.toISOString(),
    expiresAt: consent.expiresAt.toISOString(),
    lastSyncAt: consent.lastSyncAt?.toISOString() ?? null,
  };
}