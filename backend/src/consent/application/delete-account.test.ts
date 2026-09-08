import { describe, expect, it } from 'vitest';
import type { RepositorioDeAccounts } from '../../access/domain/port/driven/account-repository';
import type { Account } from '../../access/domain/model/account';
import type { SessionRepository } from '../../access/domain/port/driven/session-repository';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import { holderId, type HolderId } from '../../transactions/domain/model/holder';
import { DeleteAccountUseCase } from './delete-account';

const PESSOA_A = holderId('holder-a');

class AccountsFake implements RepositorioDeAccounts {
  contas = new Map<string, Account>();
  async porEmail() { return null; }
  async porId(id: string) { return this.contas.get(id) ?? null; }
  async salvar(a: Account) { this.contas.set(a.id, a); }
  async deleteById(id: string) { this.contas.delete(id); }
}

class SessionsFake implements SessionRepository {
  apagados: string[] = [];
  async criar() {}
  async porHashDoRefresh() { return null; }
  async revogar() {}
  async deleteByHolder(holderId: string) { this.apagados.push(holderId); }
}

class ConsentsFake implements ConsentRepository {
  apagados: string[] = [];
  async save() {}
  async findActiveByInstitution() { return null; }
  async listByHolder() { return []; }
  async findById() { return null; }
  async updateLastSyncAt() {}
  async revoke() {}
  async purgeDue() { return 0; }
  async deleteByHolder(holderId: string) { this.apagados.push(holderId); }
}

class TransactionsFake implements RepositorioDeTransactions {
  apagados: string[] = [];
  async listarDoHolder() { return []; }
  async salvarSincronizados() {}
  async deleteByHolder(holderId: HolderId) { this.apagados.push(holderId); }
}

describe('HN-012 — excluir conta e dados (RF-025, RN-016, RN-015)', () => {
  it('RN-016 — excluir apaga conta, sessões, consentimentos e transações', async () => {
    const accounts = new AccountsFake();
    const sessions = new SessionsFake();
    const consents = new ConsentsFake();
    const transactions = new TransactionsFake();
    await accounts.salvar({ id: PESSOA_A, email: 'a@x.com' as never, passwordHash: 'hash', name: '' });
    const caso = new DeleteAccountUseCase(accounts, sessions, consents, transactions);

    const resultado = await caso.executar(PESSOA_A);

    expect(resultado).toEqual({ tipo: 'excluida' });
    expect(accounts.contas.has(PESSOA_A)).toBe(false);
    expect(sessions.apagados).toEqual([PESSOA_A]);
    expect(consents.apagados).toEqual([PESSOA_A]);
    expect(transactions.apagados).toEqual([PESSOA_A]);
  });

  it('RN-015 — conta inexistente (de outra pessoa) retorna não-encontrada, sem apagar nada', async () => {
    const accounts = new AccountsFake();
    const sessions = new SessionsFake();
    const consents = new ConsentsFake();
    const transactions = new TransactionsFake();
    await accounts.salvar({ id: PESSOA_A, email: 'a@x.com' as never, passwordHash: 'hash', name: '' });
    const caso = new DeleteAccountUseCase(accounts, sessions, consents, transactions);

    const resultado = await caso.executar(holderId('holder-b'));

    expect(resultado).toEqual({ tipo: 'nao-encontrada' });
    expect(accounts.contas.has(PESSOA_A)).toBe(true);
    expect(sessions.apagados).toEqual([]);
    expect(consents.apagados).toEqual([]);
    expect(transactions.apagados).toEqual([]);
  });
});