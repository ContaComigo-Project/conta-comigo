import { describe, expect, it } from 'vitest';
import { email, EmailInvalido } from './email';

// Normalizar no domínio é o que impede "Pessoa@Exemplo.com" e
// "pessoa@exemplo.com" de virarem duas contas — e o que faz o login funcionar
// independentemente de como a pessoa digitou.
describe('Email — valor do domínio', () => {
  it('normaliza caixa e espaços em volta', () => {
    expect(email('  Pessoa@Exemplo.COM  ')).toBe('pessoa@exemplo.com');
  });

  it('duas grafias da mesma caixa produzem o mesmo valor', () => {
    expect(email('ALGUEM@teste.com')).toBe(email('alguem@TESTE.com'));
  });

  it('recusa o que não é e-mail', () => {
    for (const invalido of ['', '   ', 'sem-arroba', 'sem@dominio', '@exemplo.com', 'com espaco@exemplo.com']) {
      expect(() => email(invalido), `aceitou "${invalido}"`).toThrow(EmailInvalido);
    }
  });

  it('aceita formas válidas comuns', () => {
    for (const valido of ['a@b.co', 'nome.sobrenome@empresa.com.br', 'pessoa+marcador@exemplo.com']) {
      expect(() => email(valido), `recusou "${valido}"`).not.toThrow();
    }
  });
});
