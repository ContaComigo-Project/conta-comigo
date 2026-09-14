import type { HolderId } from '../../transactions/domain/model/holder';
import type { RepositorioDeAccounts } from '../../access/domain/port/driven/account-repository';
import type { SessionRepository } from '../../access/domain/port/driven/session-repository';
import type { ConsentRepository } from '../../consent/domain/port/driven/consent-repository';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';

export type ResultadoDaExclusao = { readonly tipo: 'excluida' } | { readonly tipo: 'nao-encontrada' };

// RF-025 / RN-016: deleting the account erases all personal and financial data
// (account, sessions, consents and transactions). The holder is the account id;
// the operation is always scoped to the holder (RN-015) — a guessed id returns
// not-found, never a confirmation.
export class DeleteAccountUseCase {
  constructor(
    private readonly accounts: RepositorioDeAccounts,
    private readonly sessions: SessionRepository,
    private readonly consents: ConsentRepository,
    private readonly transactions: RepositorioDeTransactions,
  ) {}

  async executar(holderId: HolderId): Promise<ResultadoDaExclusao> {
    const account = await this.accounts.porId(holderId);
    if (!account) return { tipo: 'nao-encontrada' };

    await this.sessions.deleteByHolder(holderId);
    await this.consents.deleteByHolder(holderId);
    await this.transactions.deleteByHolder(holderId);
    await this.accounts.deleteById(holderId);

    return { tipo: 'excluida' };
  }
}