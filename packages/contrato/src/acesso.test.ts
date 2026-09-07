import { describe, expect, it } from 'vitest';
import { ContaDTO, CredenciaisDTO, CriarContaDTO, SessaoDTO } from './acesso';

describe('contrato de acesso — HN-001', () => {
  it('cadastro exige e-mail valido e senha minima', () => {
    expect(CriarContaDTO.safeParse({ email: 'pessoa@exemplo.com', senha: 'senha-forte-1' }).success).toBe(true);
    expect(CriarContaDTO.safeParse({ email: 'nao-e-email', senha: 'senha-forte-1' }).success).toBe(false);
    expect(CriarContaDTO.safeParse({ email: 'pessoa@exemplo.com', senha: 'curta' }).success).toBe(false);
  });

  it('a conta que sai NAO tem senha nem hash — nem como campo extra', () => {
    const base = { id: 'conta-1', email: 'pessoa@exemplo.com' };
    expect(ContaDTO.safeParse(base).success).toBe(true);
    for (const proibido of ['senha', 'hashDaSenha', 'password', 'passwordHash']) {
      expect(ContaDTO.safeParse({ ...base, [proibido]: 'x' }).success, `${proibido} passou`).toBe(false);
    }
  });

  it('a sessao carrega conta, tokens e expiracao — e nada alem disso', () => {
    const sessao = {
      conta: { id: 'conta-1', email: 'pessoa@exemplo.com' },
      accessToken: 'jwt.abc.def',
      refreshToken: 'opaco-123',
      expiraEm: '2026-09-07T18:15:00.000Z',
    };
    expect(SessaoDTO.safeParse(sessao).success).toBe(true);
    expect(SessaoDTO.safeParse({ ...sessao, senha: 'x' }).success).toBe(false);
    expect(SessaoDTO.safeParse({ ...sessao, expiraEm: 'ontem' }).success).toBe(false);
  });

  it('credenciais aceitam qualquer senha nao vazia — validar tamanho na entrada seria dica ao atacante', () => {
    expect(CredenciaisDTO.safeParse({ email: 'pessoa@exemplo.com', senha: 'x' }).success).toBe(true);
    expect(CredenciaisDTO.safeParse({ email: 'pessoa@exemplo.com', senha: '' }).success).toBe(false);
  });
});
