import { describe, expect, it } from 'vitest';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { Account } from '../domain/model/account';
import type { RepositorioDeAccounts } from '../domain/port/driven/account-repository';
import type { Session, SessionRepository } from '../domain/port/driven/session-repository';
import type { TokenIssuer } from '../domain/port/driven/token-issuer';
import { InvalidCredentials } from '../domain/port/driving/access';
import { EncerrarSessionUseCase } from './end-session';
import { RenovarSessionUseCase } from './renew-session';
import { DURACAO_DO_REFRESH_EM_DIAS, gerarRefresh, refreshTokenHash } from './session';

describe('Session Helpers & UseCases — ADR-004', () => {
  const agora = new Date('2026-09-01T12:00:00Z');
  const clock: Clock = { agora: () => agora };
  const emissor: TokenIssuer = {
    emitir: (h) => ({ valor: `token-jwt-${h}`, expiresAt: new Date() }),
    validar: () => null,
  };

  describe('gerarRefresh & refreshTokenHash', () => {
    it('gera refresh aleatorio e calcula sha256 deterministico', () => {
      const r1 = gerarRefresh();
      const r2 = gerarRefresh();
      expect(r1).not.toBe(r2);

      const h1 = refreshTokenHash(r1);
      const h2 = refreshTokenHash(r1);
      expect(h1).toBe(h2);
      expect(h1).toHaveLength(64); // SHA-256 hex
    });
  });

  describe('RenovarSessionUseCase', () => {
    const mockAccount: Account = {
      id: 'acc-1',
      email: 'user@exemplo.com' as any,
      passwordHash: 'hash',
      name: 'User',
    };

    it('renova sessao com sucesso para refresh valido e nao expirado', async () => {
      const refresh = 'refresh-valido-123';
      const hash = refreshTokenHash(refresh);

      const session: Session = {
        id: 'sess-1',
        holderId: 'acc-1' as any,
        refreshTokenHash: hash,
        expiresAt: new Date(agora.getTime() + 10000),
        revokedAt: null,
      };

      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async (h) => (h === hash ? session : null),
        revogar: async () => {},
        deleteByHolder: async () => {},
      };
      const accountsRepo: RepositorioDeAccounts = {
        salvar: async () => {},
        porEmail: async () => null,
        porId: async (id) => (id === 'acc-1' ? mockAccount : null),
        deleteById: async () => {},
      };

      const useCase = new RenovarSessionUseCase(sessionRepo, accountsRepo, emissor, clock);
      const res = await useCase.executar(refresh);

      expect(res.account.id).toBe('acc-1');
      expect(res.access.valor).toBe('token-jwt-acc-1');
      expect(res.refresh).toBe(refresh);
    });

    it('rejeita com InvalidCredentials se sessao nao for encontrada', async () => {
      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async () => null,
        revogar: async () => {},
        deleteByHolder: async () => {},
      };
      const accountsRepo: RepositorioDeAccounts = {
        salvar: async () => {},
        porEmail: async () => null,
        porId: async () => null,
        deleteById: async () => {},
      };

      const useCase = new RenovarSessionUseCase(sessionRepo, accountsRepo, emissor, clock);
      await expect(useCase.executar('qualquer-refresh')).rejects.toThrow(InvalidCredentials);
    });

    it('rejeita com InvalidCredentials se sessao estiver revogada', async () => {
      const refresh = 'refresh-revogado';
      const hash = refreshTokenHash(refresh);
      const session: Session = {
        id: 'sess-1',
        holderId: 'acc-1' as any,
        refreshTokenHash: hash,
        expiresAt: new Date(agora.getTime() + 10000),
        revokedAt: new Date('2026-09-01T10:00:00Z'),
      };

      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async () => session,
        revogar: async () => {},
        deleteByHolder: async () => {},
      };
      const accountsRepo: RepositorioDeAccounts = {
        salvar: async () => {},
        porEmail: async () => null,
        porId: async () => mockAccount,
        deleteById: async () => {},
      };

      const useCase = new RenovarSessionUseCase(sessionRepo, accountsRepo, emissor, clock);
      await expect(useCase.executar(refresh)).rejects.toThrow(InvalidCredentials);
    });

    it('rejeita com InvalidCredentials se sessao estiver expirada', async () => {
      const refresh = 'refresh-expirado';
      const hash = refreshTokenHash(refresh);
      const session: Session = {
        id: 'sess-1',
        holderId: 'acc-1' as any,
        refreshTokenHash: hash,
        expiresAt: new Date(agora.getTime() - 1000), // no passado
        revokedAt: null,
      };

      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async () => session,
        revogar: async () => {},
        deleteByHolder: async () => {},
      };
      const accountsRepo: RepositorioDeAccounts = {
        salvar: async () => {},
        porEmail: async () => null,
        porId: async () => mockAccount,
        deleteById: async () => {},
      };

      const useCase = new RenovarSessionUseCase(sessionRepo, accountsRepo, emissor, clock);
      await expect(useCase.executar(refresh)).rejects.toThrow(InvalidCredentials);
    });

    it('rejeita com InvalidCredentials se titular da sessao nao existir mais', async () => {
      const refresh = 'refresh-orfao';
      const hash = refreshTokenHash(refresh);
      const session: Session = {
        id: 'sess-1',
        holderId: 'acc-apagada' as any,
        refreshTokenHash: hash,
        expiresAt: new Date(agora.getTime() + 10000),
        revokedAt: null,
      };

      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async () => session,
        revogar: async () => {},
        deleteByHolder: async () => {},
      };
      const accountsRepo: RepositorioDeAccounts = {
        salvar: async () => {},
        porEmail: async () => null,
        porId: async () => null,
        deleteById: async () => {},
      };

      const useCase = new RenovarSessionUseCase(sessionRepo, accountsRepo, emissor, clock);
      await expect(useCase.executar(refresh)).rejects.toThrow(InvalidCredentials);
    });
  });

  describe('EncerrarSessionUseCase', () => {
    it('revoga a sessao quando encontrada e ativa', async () => {
      const refresh = 'refresh-ativo';
      const hash = refreshTokenHash(refresh);
      let idRevogado: string | null = null;
      let dataRevogada: Date | null = null;

      const session: Session = {
        id: 'sess-ativa',
        holderId: 'acc-1' as any,
        refreshTokenHash: hash,
        expiresAt: new Date(agora.getTime() + 10000),
        revokedAt: null,
      };

      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async (h) => (h === hash ? session : null),
        revogar: async (id, data) => {
          idRevogado = id;
          dataRevogada = data;
        },
        deleteByHolder: async () => {},
      };

      const useCase = new EncerrarSessionUseCase(sessionRepo, clock);
      await useCase.executar(refresh);

      expect(idRevogado).toBe('sess-ativa');
      expect(dataRevogada).toEqual(agora);
    });

    it('executa de forma idempotente e silenciosa quando sessao nao existe', async () => {
      let revogou = false;
      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async () => null,
        revogar: async () => {
          revogou = true;
        },
        deleteByHolder: async () => {},
      };

      const useCase = new EncerrarSessionUseCase(sessionRepo, clock);
      await expect(useCase.executar('inexistente')).resolves.not.toThrow();
      expect(revogou).toBe(false);
    });

    it('nao revoga novamente se ja estiver revogada', async () => {
      const refresh = 'ja-revogado';
      const hash = refreshTokenHash(refresh);
      let revogou = false;

      const session: Session = {
        id: 'sess-1',
        holderId: 'acc-1' as any,
        refreshTokenHash: hash,
        expiresAt: new Date(agora.getTime() + 10000),
        revokedAt: new Date('2026-09-01T08:00:00Z'),
      };

      const sessionRepo: SessionRepository = {
        criar: async () => {},
        porHashDoRefresh: async () => session,
        revogar: async () => {
          revogou = true;
        },
        deleteByHolder: async () => {},
      };

      const useCase = new EncerrarSessionUseCase(sessionRepo, clock);
      await useCase.executar(refresh);
      expect(revogou).toBe(false);
    });
  });
});
