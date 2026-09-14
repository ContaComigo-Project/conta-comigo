import { describe, expect, it } from 'vitest';
import { novoConsent, estaAtivo, PRAZO_DO_CONSENTIMENTO_DIAS } from './model/consent';

const AGORA = new Date('2026-09-07T12:00:00Z');

function consent(params: Partial<{ revogadoEm: Date | null; expiraEm: Date }> = {}) {
  const base = novoConsent({
    id: 'c1',
    holderId: 'pessoa-1',
    institutionId: 'inst-1',
    connectionId: 'conexao-1',
    scope: 'accounts',
    credentialCipher: 'cifrado',
    agora: AGORA,
  });
  return {
    ...base,
    revokedAt: params.revogadoEm ?? base.revokedAt,
    expiresAt: params.expiraEm ?? base.expiresAt,
  };
}

describe('consent — estado ativo (RN-012)', () => {
  it('um consentimento válido está ativo', () => {
    expect(estaAtivo(consent(), AGORA)).toBe(true);
  });

  it('expirado equivale a ausente (RN-012)', () => {
    const expirado = consent({ expiraEm: new Date(AGORA.getTime() - 1_000) });
    expect(estaAtivo(expirado, AGORA)).toBe(false);
  });

  it('revogado nunca volta a ativo', () => {
    const revogado = consent({ revogadoEm: AGORA });
    expect(estaAtivo(revogado, AGORA)).toBe(false);
  });

  it('o prazo padrão do consentimento é 90 dias', () => {
    const c = novoConsent({
      id: 'x', holderId: 'p', institutionId: 'i', connectionId: 'c', scope: 'accounts',
      credentialCipher: 'cifrado', agora: AGORA,
    });
    const diferenca = c.expiresAt.getTime() - c.createdAt.getTime();
    expect(diferenca).toBe(PRAZO_DO_CONSENTIMENTO_DIAS * 24 * 60 * 60_000);
  });
});