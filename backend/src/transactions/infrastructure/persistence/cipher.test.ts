import { describe, expect, it } from 'vitest';
import { ChaveDeCipherAusente, cipherr, decipherr } from './cipher';

// Chaves de 32 bytes em hex, so para teste. Nunca use em ambiente real.
const CHAVE_A = '0'.repeat(63) + '1';
const CHAVE_B = '0'.repeat(63) + '2';

describe('RNF-014 — cipher em repouso (AES-256-GCM)', () => {
  it('o texto cipherdo nao contem o texto claro', () => {
    const cipherdo = cipherr('token-do-aggregator', CHAVE_A);
    expect(cipherdo).not.toContain('token-do-aggregator');
    expect(cipherdo).not.toBe('token-do-aggregator');
  });

  it('decipherr com a mesma chave devolve o texto original', () => {
    expect(decipherr(cipherr('token-do-aggregator', CHAVE_A), CHAVE_A)).toBe('token-do-aggregator');
  });

  it('cipherr o mesmo texto duas vezes produz saidas diferentes (IV aleatorio)', () => {
    expect(cipherr('mesmo texto', CHAVE_A)).not.toBe(cipherr('mesmo texto', CHAVE_A));
  });

  it('decipherr com outra chave falha em vez de devolver lixo', () => {
    const cipherdo = cipherr('token-do-aggregator', CHAVE_A);
    expect(() => decipherr(cipherdo, CHAVE_B)).toThrow();
  });

  it('texto cipherdo adulterado e rejeitado (autenticacao do GCM)', () => {
    const cipherdo = cipherr('token-do-aggregator', CHAVE_A);
    const adulterado = cipherdo.slice(0, -2) + (cipherdo.endsWith('AA') ? 'BB' : 'AA');
    expect(() => decipherr(adulterado, CHAVE_A)).toThrow();
  });

  it('sem ENCRYPTION_KEY recusa operar com error nomeado — nunca grava texto claro', () => {
    expect(() => cipherr('qualquer coisa', undefined)).toThrow(ChaveDeCipherAusente);
    expect(() => decipherr('qualquer coisa', undefined)).toThrow(ChaveDeCipherAusente);
  });

  it('chave com tamanho errado e rejeitada', () => {
    expect(() => cipherr('x', 'abc')).toThrow();
  });
});
