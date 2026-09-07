import { describe, expect, it } from 'vitest';
import { ChaveDeCifraAusente, cifrar, decifrar } from './cifra';

// Chaves de 32 bytes em hex, so para teste. Nunca use em ambiente real.
const CHAVE_A = '0'.repeat(63) + '1';
const CHAVE_B = '0'.repeat(63) + '2';

describe('RNF-014 — cifra em repouso (AES-256-GCM)', () => {
  it('o texto cifrado nao contem o texto claro', () => {
    const cifrado = cifrar('token-do-agregador', CHAVE_A);
    expect(cifrado).not.toContain('token-do-agregador');
    expect(cifrado).not.toBe('token-do-agregador');
  });

  it('decifrar com a mesma chave devolve o texto original', () => {
    expect(decifrar(cifrar('token-do-agregador', CHAVE_A), CHAVE_A)).toBe('token-do-agregador');
  });

  it('cifrar o mesmo texto duas vezes produz saidas diferentes (IV aleatorio)', () => {
    expect(cifrar('mesmo texto', CHAVE_A)).not.toBe(cifrar('mesmo texto', CHAVE_A));
  });

  it('decifrar com outra chave falha em vez de devolver lixo', () => {
    const cifrado = cifrar('token-do-agregador', CHAVE_A);
    expect(() => decifrar(cifrado, CHAVE_B)).toThrow();
  });

  it('texto cifrado adulterado e rejeitado (autenticacao do GCM)', () => {
    const cifrado = cifrar('token-do-agregador', CHAVE_A);
    const adulterado = cifrado.slice(0, -2) + (cifrado.endsWith('AA') ? 'BB' : 'AA');
    expect(() => decifrar(adulterado, CHAVE_A)).toThrow();
  });

  it('sem ENCRYPTION_KEY recusa operar com erro nomeado — nunca grava texto claro', () => {
    expect(() => cifrar('qualquer coisa', undefined)).toThrow(ChaveDeCifraAusente);
    expect(() => decifrar('qualquer coisa', undefined)).toThrow(ChaveDeCifraAusente);
  });

  it('chave com tamanho errado e rejeitada', () => {
    expect(() => cifrar('x', 'abc')).toThrow();
  });
});
