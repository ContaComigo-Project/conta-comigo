import { randomUUID } from 'node:crypto';
import type { Account } from '../domain/model/account';
import { email as fazerEmail, EmailInvalido } from '../domain/model/email';
import { RegistrationRefused, type CriarAccount } from '../domain/port/driving/access';
import type { PasswordHasher } from '../domain/port/driven/password-hasher';
import type { RepositorioDeAccounts } from '../domain/port/driven/account-repository';

export class CriarAccountUseCase implements CriarAccount {
  constructor(
    private readonly accounts: RepositorioDeAccounts,
    private readonly hash: PasswordHasher,
  ) {}

  async executar(emailEmTexto: string, senhaEmClaro: string): Promise<Account> {
    let email;
    try {
      email = fazerEmail(emailEmTexto);
    } catch (error) {
      // E-mail malformado e e-mail ja existente dao a MESMA recusa: distinguir
      // permitiria enumerar quem tem account (RF-001).
      if (error instanceof EmailInvalido) throw new RegistrationRefused();
      throw error;
    }

    if (await this.accounts.porEmail(email)) throw new RegistrationRefused();

    const account: Account = { id: randomUUID(), email, passwordHash: await this.hash.gerar(senhaEmClaro), name: '' };
    await this.accounts.salvar(account);
    return account;
  }
}
