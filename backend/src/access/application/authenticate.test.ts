import { describe, expect, it } from 'vitest';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { Account } from '../domain/model/account';
import type { RepositorioDeAccounts } from '../domain/port/driven/account-repository';
import type { PasswordHasher } from '../domain/port/driven/password-hasher';
import type { Session, SessionRepository } from '../domain/port/driven/session-repository';
import type { TokenIssuer } from '../domain/port/driven/token-issuer';
import { InvalidCredentials } from '../domain/port/driving/access';
import { AuthenticateUseCase } from './authenticate';
import { DURACAO_DO_REFRESH_EM_DIAS } from './session';

describe('AuthenticateUseCase — RF-002', () => {
  const criarClock = (instante = new Date('2026-09-01T12:00:00Z')): Clock => ({
    agora: () => instante,
  });

  const criarHasher = (): PasswordHasher => ({
    gerar: async (senha) => `hash-${senha}`,
    conferir: async (senha, hash) => hash === `hash-${senha}`,
  });

  const criarEmissor = (): TokenIssuer => ({
    emitir: (holder) => ({ valor: `jwt-token-${holder}`, expiresAt: new Date() }),
    validar: () => null,
  });

  it('autentica com sucesso com credenciais validas e cria sessao de 30 dias', async () => {
    const accountSalva: Account = {
      id: 'acc-123',
      email: 'pessoa@exemplo.com' as any,
      passwordHash: 'hash-SenhaCerta123',
      name: 'Pessoa',
    };

    const sessoesCriadas: Session[] = [];
    const accountsRepo: RepositorioDeAccounts = {
      salvar: async () => {},
      porEmail: async (e) => (e === 'pessoa@exemplo.com' ? accountSalva : null),
      porId: async () => null,
      deleteById: async () => {},
    };
    const sessionRepo: SessionRepository = {
      criar: async (s) => {
        sessoesCriadas.push(s);
      },
      porHashDoRefresh: async () => null,
      revogar: async () => {},
      deleteByHolder: async () => {},
    };

    const clock = criarClock(new Date('2026-09-01T10:00:00Z'));
    const useCase = new AuthenticateUseCase(accountsRepo, sessionRepo, criarHasher(), criarEmissor(), clock);

    const resultado = await useCase.executar('pessoa@exemplo.com', 'SenhaCerta123');

    expect(resultado.account.id).toBe('acc-123');
    expect(resultado.access.valor).toBe('jwt-token-acc-123');
    expect(resultado.refresh).toBeDefined();
    expect(sessoesCriadas).toHaveLength(1);
    expect(sessoesCriadas[0].holderId).toBe('acc-123');
    const expiracaoEsperada = new Date(
      new Date('2026-09-01T10:00:00Z').getTime() + DURACAO_DO_REFRESH_EM_DIAS * 24 * 60 * 60 * 1000,
    );
    expect(sessoesCriadas[0].expiresAt.toISOString()).toBe(expiracaoEsperada.toISOString());
  });

  it('rejeita com InvalidCredentials quando o email for malformado (anti-enumeracao)', async () => {
    const accountsRepo: RepositorioDeAccounts = {
      salvar: async () => {},
      porEmail: async () => null,
      porId: async () => null,
      deleteById: async () => {},
    };
    const sessionRepo: SessionRepository = {
      criar: async () => {},
      porHashDoRefresh: async () => null,
      revogar: async () => {},
      deleteByHolder: async () => {},
    };

    const useCase = new AuthenticateUseCase(accountsRepo, sessionRepo, criarHasher(), criarEmissor(), criarClock());
    await expect(useCase.executar('email-malformado', 'qualquer-senha')).rejects.toThrow(InvalidCredentials);
  });

  it('rejeita com InvalidCredentials quando a conta nao existe executando comparacao constante', async () => {
    let conferiuComHashFalso = false;
    const hasher: PasswordHasher = {
      gerar: async () => 'hash',
      conferir: async (_senha, hash) => {
        if (hash.startsWith('$2b$04$')) conferiuComHashFalso = true;
        return false;
      },
    };
    const accountsRepo: RepositorioDeAccounts = {
      salvar: async () => {},
      porEmail: async () => null,
      porId: async () => null,
      deleteById: async () => {},
    };
    const sessionRepo: SessionRepository = {
      criar: async () => {},
      porHashDoRefresh: async () => null,
      revogar: async () => {},
      deleteByHolder: async () => {},
    };

    const useCase = new AuthenticateUseCase(accountsRepo, sessionRepo, hasher, criarEmissor(), criarClock());
    await expect(useCase.executar('inexistente@exemplo.com', 'senha')).rejects.toThrow(InvalidCredentials);
    expect(conferiuComHashFalso).toBe(true);
  });

  it('rejeita com InvalidCredentials quando a senha estiver incorreta', async () => {
    const accountSalva: Account = {
      id: 'acc-123',
      email: 'pessoa@exemplo.com' as any,
      passwordHash: 'hash-SenhaCerta123',
      name: 'Pessoa',
    };
    const accountsRepo: RepositorioDeAccounts = {
      salvar: async () => {},
      porEmail: async () => accountSalva,
      porId: async () => null,
      deleteById: async () => {},
    };
    const sessionRepo: SessionRepository = {
      criar: async () => {},
      porHashDoRefresh: async () => null,
      revogar: async () => {},
      deleteByHolder: async () => {},
    };

    const useCase = new AuthenticateUseCase(accountsRepo, sessionRepo, criarHasher(), criarEmissor(), criarClock());
    await expect(useCase.executar('pessoa@exemplo.com', 'SenhaErrada')).rejects.toThrow(InvalidCredentials);
  });
});
