import type { Account } from '../../domain/model/account';
import type { Email } from '../../domain/model/email';
import type { RepositorioDeAccounts } from '../../domain/port/driven/account-repository';

// Adaptador falso (ADR-001: todo adaptador nasce com implementacao falsa).
export class RepositorioDeAccountsEmMemoria implements RepositorioDeAccounts {
  private readonly porId_ = new Map<string, Account>();

  async porEmail(email: Email): Promise<Account | null> {
    return [...this.porId_.values()].find((c) => c.email === email) ?? null;
  }

  async porId(id: string): Promise<Account | null> {
    return this.porId_.get(id) ?? null;
  }

  async salvar(account: Account): Promise<void> {
    this.porId_.set(account.id, account);
  }
}
