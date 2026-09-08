import type { Account } from '../../model/account';
import type { Email } from '../../model/email';

export interface RepositorioDeAccounts {
  porEmail(email: Email): Promise<Account | null>;
  porId(id: string): Promise<Account | null>;
  salvar(account: Account): Promise<void>;
  /** Definitively deletes the account (RN-016, account deletion). */
  deleteById(id: string): Promise<void>;
}
