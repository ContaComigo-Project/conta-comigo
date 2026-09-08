import { describe, expect, it } from 'vitest';
import { novoConsent, estaAtivo, PRAZO_DE_EXCLUSAO_HORAS, type Consent } from '../domain/model/consent';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import { RevokeConsentUseCase } from './revoke-consent';

const AGORA = new Date('2026-09-08T12:00:00Z');

class RepoFake implements ConsentRepository {
  private readonly dados = new Map<string, Consent>();
  async save(c: Consent) { this.dados.set(c.id, c); }
  async findActiveByInstitution() { return null; }
  async listByHolder(holderId: string) { return [...this.dados.values()].filter((c) => c.holderId === holderId); }
  async findById(holderId: string, consentId: string) {
    const c = this.dados.get(consentId);
    return c && c.holderId === holderId ? c : null;
  }
  async updateLastSyncAt() {}
  async revoke() {}
  async purgeDue() { return 0; }
  async deleteByHolder() {}
}

function consentido(holderId: string, institutionId: string) {
  return novoConsent({
    id: `consent-${holderId}-${institutionId}`,
    holderId, institutionId, connectionId: 'c1', scope: 'accounts',
    credentialCipher: 'cifrado', agora: AGORA,
  });
}

describe('HN-012 — revogar consentimento (RF-006, RN-013, RN-015)', () => {
  it('RN-013 — revogar marca revogado na hora e agenda exclusão em até 24h', async () => {
    const repo = new RepoFake();
    await repo.save(consentido('pessoa-1', 'inst-1'));
    const caso = new RevokeConsentUseCase(repo);

    const resultado = await caso.executar({ holderId: 'pessoa-1', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });

    expect(resultado).toEqual({ tipo: 'revogado' });
    const revogado = await repo.findById('pessoa-1', 'consent-pessoa-1-inst-1');
    expect(revogado?.revokedAt).toEqual(AGORA);
    expect(estaAtivo(revogado!, AGORA)).toBe(false);
    // Exclusão definitiva agendada: agora + 24h.
    expect(revogado?.deletionScheduledAt?.getTime()).toBe(AGORA.getTime() + PRAZO_DE_EXCLUSAO_HORAS * 60 * 60_000);
  });

  it('RN-013 — a instituição revogada não aparece mais na lista de conectadas', async () => {
    const repo = new RepoFake();
    await repo.save(consentido('pessoa-1', 'inst-1'));
    const caso = new RevokeConsentUseCase(repo);
    await caso.executar({ holderId: 'pessoa-1', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });

    const ativos = (await repo.listByHolder('pessoa-1')).filter((c) => estaAtivo(c, AGORA));
    expect(ativos.length).toBe(0);
  });

  it('RN-015 — consentimento de outra pessoa não é revogado (não-encontrado)', async () => {
    const repo = new RepoFake();
    await repo.save(consentido('pessoa-1', 'inst-1'));
    const caso = new RevokeConsentUseCase(repo);

    const resultado = await caso.executar({ holderId: 'pessoa-2', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });
    expect(resultado).toEqual({ tipo: 'nao-encontrado' });
    // Não foi revogado por engano.
    const original = await repo.findById('pessoa-1', 'consent-pessoa-1-inst-1');
    expect(original?.revokedAt).toBeNull();
  });
});