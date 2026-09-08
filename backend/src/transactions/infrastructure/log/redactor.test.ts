import { describe, expect, it } from 'vitest';
import { MARCA, redigir } from './redactor';
import { holderId } from '../../domain/model/holder';
import type { Transaction } from '../../domain/model/transaction';

// RNF-015: valor, description, token e e-mail nao sobrevivem a serializacao para
// log. O teste usa a ENTIDADE real, nao um objeto inventado — e o objeto real
// que vaza quando alguem loga o error inteiro.
const transaction: Transaction = {
  id: 'txn_001',
  holderId: holderId('holder-a'),
  description: 'Farmacia Sao Joao',
  amountInCents: -8740,
  dueDate: new Date('2026-09-05T15:30:00.000Z'),
  externalId: 'ext-1',
};

const texto = (v: unknown) => JSON.stringify(redigir(v));

describe('RNF-015 — redactor de log', () => {
  it('description e valor de um transaction nao aparecem no texto', () => {
    const t = texto(transaction);
    expect(t).not.toContain('Farmacia Sao Joao');
    expect(t).not.toContain('8740');
    expect(t).toContain(MARCA);
  });

  it('o identificador do recurso e do holder permanecem — sem eles nao se investiga nada', () => {
    const t = texto(transaction);
    expect(t).toContain('txn_001');
    expect(t).toContain('holder-a');
  });

  it('alcanca objeto aninhado, que e como o dado vaza na pratica', () => {
    const t = texto({ operacao: 'listar', error: { causa: { transaction } } });
    expect(t).not.toContain('Farmacia Sao Joao');
    expect(t).toContain('listar');
  });

  it('alcanca item dentro de lista', () => {
    const t = texto({ dados: [transaction, transaction] });
    expect(t).not.toContain('Farmacia Sao Joao');
  });

  it('redige credencial e dado pessoal por nome de campo', () => {
    const t = texto({
      authorization: 'Bearer abc.def.ghi',
      token: 'tok_live_123',
      email: 'pessoa@exemplo.com',
      senha: 'segredo',
      cpf: '000.000.000-00',
    });
    for (const vazado of ['Bearer abc.def.ghi', 'tok_live_123', 'pessoa@exemplo.com', 'segredo', '000.000.000-00']) {
      expect(t, `${vazado} vazou`).not.toContain(vazado);
    }
  });

  it('nao inventa campo nem quebra valor primitivo', () => {
    expect(redigir('texto simples')).toBe('texto simples');
    expect(redigir(42)).toBe(42);
    expect(redigir(null)).toBe(null);
  });

  it('preserva a data, que nao e dado sensivel e serve para investigar', () => {
    expect(texto(transaction)).toContain('2026-09-05');
  });
});
