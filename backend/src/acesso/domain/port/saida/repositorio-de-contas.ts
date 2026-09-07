import type { Conta } from '../../model/conta';
import type { Email } from '../../model/email';

export interface RepositorioDeContas {
  porEmail(email: Email): Promise<Conta | null>;
  porId(id: string): Promise<Conta | null>;
  salvar(conta: Conta): Promise<void>;
}
