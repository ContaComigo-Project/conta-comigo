import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { novoConsent, estaAtivo } from '../../domain/model/consent';
import { ConsentRepositoryPrisma } from './consent-repository-prisma';

const AGORA = new Date('2026-09-07T12:00:00Z');

// Integration test: talks to the compose PostgreSQL, migrations applied by
// `harness setup`. Runs in `test-integration`, not in `test-unit` (ADR-003).
describe('ConsentRepositoryPrisma — round trip on the real PostgreSQL', () => {
  const repositorio = new ConsentRepositoryPrisma();

  beforeEach(async () => {
    // Truncate the consents table between scenarios (only for tests).
    const prisma = (repositorio as unknown as { prisma: { consent: { deleteMany(): Promise<unknown> } } }).prisma;
    await prisma.consent.deleteMany();
  });

  afterAll(async () => {
    const prisma = (repositorio as unknown as { prisma: { $disconnect(): Promise<unknown> } }).prisma;
    await prisma.$disconnect();
  });

  it('um consent salvo volta idêntico e ativo', async () => {
    const original = novoConsent({
      id: 'consent-1',
      holderId: 'holder-a',
      institutionId: 'inst-1',
      connectionId: 'conexao-1',
      scope: 'accounts',
      credentialCipher: 'cifrado',
      agora: AGORA,
    });

    await repositorio.save(original);
    const lido = await repositorio.findById('holder-a', 'consent-1');

    expect(lido).toEqual(original);
    expect(estaAtivo(lido!, AGORA)).toBe(true);
  });

  it('findById só devolve o consentimento do próprio holder (RN-015)', async () => {
    await repositorio.save(
      novoConsent({
        id: 'consent-a', holderId: 'holder-a', institutionId: 'inst-1',
        connectionId: 'c1', scope: 'accounts', credentialCipher: 'c', agora: AGORA,
      }),
    );

    expect(await repositorio.findById('holder-b', 'consent-a')).toBeNull();
  });

  it('revoke torna o consentimento inativo (RN-014)', async () => {
    await repositorio.save(
      novoConsent({
        id: 'consent-r', holderId: 'holder-a', institutionId: 'inst-1',
        connectionId: 'c1', scope: 'accounts', credentialCipher: 'c', agora: AGORA,
      }),
    );
    await repositorio.revoke('consent-r', AGORA);

    expect(await repositorio.findActiveByInstitution('holder-a', 'inst-1', AGORA)).toBeNull();
  });
});