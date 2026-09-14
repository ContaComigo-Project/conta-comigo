import { describe, expect, it } from 'vitest';
import type { Account } from '../domain/model/account';
import type { RepositorioDeAccounts } from '../domain/port/driven/account-repository';
import type { PasswordHasher } from '../domain/port/driven/password-hasher';
import { RegistrationRefused } from '../domain/port/driving/access';
import { CriarAccountUseCase } from './create-account';

describe('CriarAccountUseCase — RF-001', () => {
  const criarHasher = (): PasswordHasher => ({
    gerar: async (senha) => `hash-${senha}`,
    conferir: async (senha, hash) => hash === `hash-${senha}`,
  });

  it('cria conta com sucesso quando email e valido e inedito', async () => {
    const salvas: Account[] = [];
    const repo: RepositorioDeAccounts = {
      salvar: async (acc) => {
        salvas.push(acc);
      },
      porEmail: async () => null,
      porId: async () => null,
      deleteById: async () => {},
    };

    const useCase = new CriarAccountUseCase(repo, criarHasher());
    const account = await useCase.executar('nova.pessoa@exemplo.com', 'SenhaForte123!');

    expect(account.email).toBe('nova.pessoa@exemplo.com');
    expect(account.passwordHash).toBe('hash-SenhaForte123!');
    expect(account.id).toBeDefined();
    expect(salvas).toHaveLength(1);
    expect(salvas[0].id).toBe(account.id);
  });

  it('recusa registro com RegistrationRefused se email for malformado (RF-001 anti-enumeracao)', async () => {
    const repo: RepositorioDeAccounts = {
      salvar: async () => {},
      porEmail: async () => null,
      porId: async () => null,
      deleteById: async () => {},
    };

    const useCase = new CriarAccountUseCase(repo, criarHasher());
    await expect(useCase.executar('email-invalido', 'SenhaForte123!')).rejects.toThrow(RegistrationRefused);
  });

  it('recusa registro com RegistrationRefused se email ja existir (RF-001 anti-enumeracao)', async () => {
    const repo: RepositorioDeAccounts = {
      salvar: async () => {},
      porEmail: async (email) => ({
        id: 'acc-existente',
        email,
        passwordHash: 'hash-existente',
        name: 'Ana',
      }),
      porId: async () => null,
      deleteById: async () => {},
    };

    const useCase = new CriarAccountUseCase(repo, criarHasher());
    await expect(useCase.executar('ana@exemplo.com', 'SenhaForte123!')).rejects.toThrow(RegistrationRefused);
  });

  it('propaga erros inesperados de infraestrutura', async () => {
    const repo: RepositorioDeAccounts = {
      salvar: async () => {},
      porEmail: async () => {
        throw new Error('Falha no banco de dados');
      },
      porId: async () => null,
      deleteById: async () => {},
    };

    const useCase = new CriarAccountUseCase(repo, criarHasher());
    await expect(useCase.executar('ana@exemplo.com', 'SenhaForte123!')).rejects.toThrow('Falha no banco de dados');
  });
});
