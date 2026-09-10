import { describe, expect, it } from 'vitest';
import { holderId } from './holder';

describe('holderId — RN-015', () => {
  it('cria um HolderId valido para string nao vazia', () => {
    const id = holderId('holder-123');
    expect(id).toBe('holder-123');
  });

  it('lanca erro ao tentar criar HolderId com string vazia ou apenas espacos', () => {
    expect(() => holderId('')).toThrow('HolderId vazio: sem holder nao ha barreira.');
    expect(() => holderId('   ')).toThrow('HolderId vazio: sem holder nao ha barreira.');
  });
});
