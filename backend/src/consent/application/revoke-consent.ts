import { revogarComAgendamento } from '../domain/model/consent';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';

export interface RevokeConsentInput {
  readonly holderId: string;
  readonly consentId: string;
  readonly agora: Date;
}

export type ResultadoDaRevogacao =
  | { readonly tipo: 'revogado' }
  | { readonly tipo: 'nao-encontrado' };

// RF-006 / RN-013: revoking takes the institution out of the panel immediately
// (the list only returns active consents) and schedules the definitive deletion
// up to 24h later. Always scoped to the holder (RN-015).
export class RevokeConsentUseCase {
  constructor(private readonly repo: ConsentRepository) {}

  async executar(input: RevokeConsentInput): Promise<ResultadoDaRevogacao> {
    const consent = await this.repo.findById(input.holderId, input.consentId);
    if (!consent) return { tipo: 'nao-encontrado' };

    await this.repo.save(revogarComAgendamento(consent, input.agora));
    return { tipo: 'revogado' };
  }
}