import { describe, expect, it } from 'vitest';
import { AccountDTO, CredentialsDTO, CreateAccountDTO, SessionDTO } from './access';

describe('contrato de access — HN-001', () => {
  it('cadastro exige e-mail valido e senha minima', () => {
    expect(CreateAccountDTO.safeParse({ email: 'pessoa@exemplo.com', senha: 'senha-forte-1' }).success).toBe(true);
    expect(CreateAccountDTO.safeParse({ email: 'nao-e-email', senha: 'senha-forte-1' }).success).toBe(false);
    expect(CreateAccountDTO.safeParse({ email: 'pessoa@exemplo.com', senha: 'curta' }).success).toBe(false);
  });

  it('a account que sai NAO tem senha nem hash — nem como campo extra', () => {
    const base = { id: 'account-1', email: 'pessoa@exemplo.com' };
    expect(AccountDTO.safeParse(base).success).toBe(true);
    for (const proibido of ['senha', 'passwordHash', 'password', 'passwordHash']) {
      expect(AccountDTO.safeParse({ ...base, [proibido]: 'x' }).success, `${proibido} passou`).toBe(false);
    }
  });

  it('a session carrega account, tokens e expiracao — e nada alem disso', () => {
    const session = {
      account: { id: 'account-1', email: 'pessoa@exemplo.com' },
      accessToken: 'jwt.abc.def',
      refreshToken: 'opaco-123',
      expiresAt: '2026-09-07T18:15:00.000Z',
    };
    expect(SessionDTO.safeParse(session).success).toBe(true);
    expect(SessionDTO.safeParse({ ...session, senha: 'x' }).success).toBe(false);
    expect(SessionDTO.safeParse({ ...session, expiresAt: 'ontem' }).success).toBe(false);
  });

  it('credenciais aceitam qualquer senha nao vazia — validar tamanho na input seria dica ao atacante', () => {
    expect(CredentialsDTO.safeParse({ email: 'pessoa@exemplo.com', senha: 'x' }).success).toBe(true);
    expect(CredentialsDTO.safeParse({ email: 'pessoa@exemplo.com', senha: '' }).success).toBe(false);
  });
});
