import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { HolderId } from '../../../transactions/domain/model/holder';
import { email as fazerEmail } from '../../domain/model/email';
import { RepositorioDeAccountsPrisma } from './account-repository-prisma';
import { SessionRepositoryPrisma } from './session-repository-prisma';

describe('Access Repositories (Prisma) — persistencia no PostgreSQL real', () => {
  const accountsRepo = new RepositorioDeAccountsPrisma();
  const sessionRepo = new SessionRepositoryPrisma();

  const idTeste1 = randomUUID();
  const idTeste2 = randomUUID();
  const emailTeste1 = fazerEmail(`integracao-${idTeste1.slice(0, 8)}@exemplo.com`);
  const emailTeste2 = fazerEmail(`integracao-${idTeste2.slice(0, 8)}@exemplo.com`);

  beforeEach(async () => {
    await sessionRepo.deleteByHolder(idTeste1);
    await sessionRepo.deleteByHolder(idTeste2);
    await accountsRepo.deleteById(idTeste1);
    await accountsRepo.deleteById(idTeste2);
  });

  afterAll(async () => {
    await sessionRepo.deleteByHolder(idTeste1);
    await sessionRepo.deleteByHolder(idTeste2);
    await accountsRepo.deleteById(idTeste1);
    await accountsRepo.deleteById(idTeste2);
    await accountsRepo.encerrar();
    await sessionRepo.encerrar();
  });

  describe('RepositorioDeAccountsPrisma', () => {
    it('salva e recupera conta por id e email', async () => {
      await accountsRepo.salvar({
        id: idTeste1,
        email: emailTeste1,
        passwordHash: 'hash-seguro-123',
        name: 'Ana Silva',
      });

      const porId = await accountsRepo.porId(idTeste1);
      expect(porId).not.toBeNull();
      expect(porId?.id).toBe(idTeste1);
      expect(porId?.email).toBe(emailTeste1);
      expect(porId?.name).toBe('Ana Silva');

      const porEmail = await accountsRepo.porEmail(emailTeste1);
      expect(porEmail).not.toBeNull();
      expect(porEmail?.id).toBe(idTeste1);
    });

    it('atualiza conta existente atraves de upsert', async () => {
      await accountsRepo.salvar({
        id: idTeste1,
        email: emailTeste1,
        passwordHash: 'hash-v1',
        name: 'Nome Antigo',
      });

      await accountsRepo.salvar({
        id: idTeste1,
        email: emailTeste1,
        passwordHash: 'hash-v2',
        name: 'Nome Novo',
      });

      const atualizado = await accountsRepo.porId(idTeste1);
      expect(atualizado?.passwordHash).toBe('hash-v2');
      expect(atualizado?.name).toBe('Nome Novo');
    });

    it('retorna null para conta inexistente', async () => {
      const naoExiste = await accountsRepo.porId(randomUUID());
      expect(naoExiste).toBeNull();
    });

    it('exclui conta por id', async () => {
      await accountsRepo.salvar({
        id: idTeste1,
        email: emailTeste1,
        passwordHash: 'hash-123',
        name: 'Para Deletar',
      });

      await accountsRepo.deleteById(idTeste1);
      const aposDelete = await accountsRepo.porId(idTeste1);
      expect(aposDelete).toBeNull();
    });
  });

  describe('SessionRepositoryPrisma', () => {
    it('cria sessao e busca por hash do refresh', async () => {
      await accountsRepo.salvar({
        id: idTeste1,
        email: emailTeste1,
        passwordHash: 'hash-123',
        name: 'Dono da Sessao',
      });

      const hashRefresh = `hash-refresh-${randomUUID()}`;
      const sessaoId = randomUUID();
      const expira = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

      await sessionRepo.criar({
        id: sessaoId,
        holderId: idTeste1 as HolderId,
        refreshTokenHash: hashRefresh,
        expiresAt: expira,
        revokedAt: null,
      });

      const encontrada = await sessionRepo.porHashDoRefresh(hashRefresh);
      expect(encontrada).not.toBeNull();
      expect(encontrada?.id).toBe(sessaoId);
      expect(encontrada?.holderId).toBe(idTeste1);
      expect(encontrada?.revokedAt).toBeNull();

      const quandoRevogado = new Date();
      await sessionRepo.revogar(sessaoId, quandoRevogado);

      const revogada = await sessionRepo.porHashDoRefresh(hashRefresh);
      expect(revogada?.revokedAt).not.toBeNull();
    });

    it('retorna null para refresh inexistente', async () => {
      const inexistente = await sessionRepo.porHashDoRefresh('hash-que-nao-existe');
      expect(inexistente).toBeNull();
    });

    it('exclui todas as sessoes de um titular ao deletar por holder', async () => {
      await accountsRepo.salvar({
        id: idTeste2,
        email: emailTeste2,
        passwordHash: 'hash-123',
        name: 'Titular Dois',
      });

      const hash1 = `hash1-${randomUUID()}`;
      const hash2 = `hash2-${randomUUID()}`;

      await sessionRepo.criar({
        id: randomUUID(),
        holderId: idTeste2 as HolderId,
        refreshTokenHash: hash1,
        expiresAt: new Date(Date.now() + 60000),
        revokedAt: null,
      });

      await sessionRepo.criar({
        id: randomUUID(),
        holderId: idTeste2 as HolderId,
        refreshTokenHash: hash2,
        expiresAt: new Date(Date.now() + 60000),
        revokedAt: null,
      });

      expect(await sessionRepo.porHashDoRefresh(hash1)).not.toBeNull();
      expect(await sessionRepo.porHashDoRefresh(hash2)).not.toBeNull();

      await sessionRepo.deleteByHolder(idTeste2);

      expect(await sessionRepo.porHashDoRefresh(hash1)).toBeNull();
      expect(await sessionRepo.porHashDoRefresh(hash2)).toBeNull();
    });
  });
});
