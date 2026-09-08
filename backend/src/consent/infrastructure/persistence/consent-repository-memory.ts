import { estaAtivo, type Consent } from '../../domain/model/consent';
import type { ConsentRepository } from '../../domain/port/driven/consent-repository';

// In-memory implementation for unit tests and for the local environment without
// Postgres (ADR-003: domain use cases run without infra).

export class ConsentRepositoryMemory implements ConsentRepository {
  private readonly dados = new Map<string, Consent>();

  async save(consent: Consent): Promise<void> {
    this.dados.set(consent.id, consent);
  }

  async findActiveByInstitution(holderId: string, institutionId: string, agora: Date): Promise<Consent | null> {
    for (const c of this.dados.values()) {
      if (c.holderId === holderId && c.institutionId === institutionId && estaAtivo(c, agora)) return c;
    }
    return null;
  }

  async listByHolder(holderId: string): Promise<readonly Consent[]> {
    return [...this.dados.values()].filter((c) => c.holderId === holderId);
  }

  async findById(holderId: string, consentId: string): Promise<Consent | null> {
    const c = this.dados.get(consentId);
    return c && c.holderId === holderId ? c : null;
  }

  async updateLastSyncAt(consentId: string, agora: Date): Promise<void> {
    const c = this.dados.get(consentId);
    if (c) this.dados.set(consentId, { ...c, lastSyncAt: agora });
  }

  async revoke(consentId: string, agora: Date): Promise<void> {
    const c = this.dados.get(consentId);
    if (c) this.dados.set(consentId, { ...c, revokedAt: agora });
  }

  async purgeDue(agora: Date): Promise<number> {
    let apagados = 0;
    for (const [id, c] of this.dados) {
      if (c.deletionScheduledAt !== null && c.deletionScheduledAt.getTime() <= agora.getTime()) {
        this.dados.delete(id);
        apagados += 1;
      }
    }
    return apagados;
  }

  async deleteByHolder(holderId: string): Promise<void> {
    for (const [id, c] of this.dados) {
      if (c.holderId === holderId) this.dados.delete(id);
    }
  }
}