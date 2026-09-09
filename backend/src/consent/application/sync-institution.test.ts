import { describe, expect, it } from 'vitest';
import type { OpenFinanceAggregator } from '../../aggregation/domain/port/driven/open-finance-aggregator';
import { falha, ok, type ResultDaAgregacao } from '../../aggregation/domain/model/aggregation-result';
import type { AccountExterna, TransactionExterno } from '../../aggregation/domain/model/external-account';
import { estaAtivo, novoConsent, type Consent } from '../domain/model/consent';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import type { ExternalAccountRepository } from '../../transactions/domain/port/driven/external-account-repository';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { ExternalAccount } from '../../transactions/domain/model/external-account';
import type { Transaction } from '../../transactions/domain/model/transaction';
import { SyncInstitutionUseCase } from './sync-institution';

const AGORA = new Date('2026-03-15T12:00:00Z');

class RepoFake implements ConsentRepository {
  private readonly dados = new Map<string, Consent>();
  async save(c: Consent) { this.dados.set(c.id, c); }
  async findActiveByInstitution(holderId: string, institutionId: string, agora: Date) {
    for (const c of this.dados.values()) if (c.holderId === holderId && c.institutionId === institutionId && estaAtivo(c, agora)) return c;
    return null;
  }
  async listByHolder(holderId: string) { return [...this.dados.values()].filter((c) => c.holderId === holderId); }
  async findById(holderId: string, consentId: string) {
    const c = this.dados.get(consentId);
    return c && c.holderId === holderId ? c : null;
  }
  async updateLastSyncAt(id: string, agora: Date) { const c = this.dados.get(id); if (c) this.dados.set(id, { ...c, lastSyncAt: agora }); }
  async revoke(id: string, agora: Date) { const c = this.dados.get(id); if (c) this.dados.set(id, { ...c, revokedAt: agora }); }
  async purgeDue(): Promise<number> { return 0; }
  async deleteByHolder(holderId: string): Promise<void> { for (const [k, v] of this.dados) if (v.holderId === holderId) this.dados.delete(k); }
}

class AggregadorOk implements OpenFinanceAggregator {
  async criarConexao() { return ok({ connectionId: 'conexao-1', token: 'token' }); }
  async listarAccounts() {
    return ok([
      { idExterno: 'a1', instituicao: 'Banco', tipo: 'corrente', saldoEmCentavos: 1_000 },
    ] as readonly AccountExterna[]);
  }
  async listarTransactions() {
    return ok([
      { idExterno: 't1', idDaAccountExterna: 'a1', descriptionOriginal: 'PAG*LOJA', amountInCents: -100, dueDate: AGORA },
    ] as readonly TransactionExterno[]);
  }
}

class AggregadorFora implements OpenFinanceAggregator {
  criarConexao(): Promise<ResultDaAgregacao<{ connectionId: string; token: string }>> {
    return Promise.resolve(falha('indisponivel', 'provedor fora'));
  }
  listarAccounts(): Promise<ResultDaAgregacao<readonly AccountExterna[]>> {
    return Promise.resolve(falha('indisponivel', 'provedor fora'));
  }
  listarTransactions(): Promise<ResultDaAgregacao<readonly TransactionExterno[]>> {
    return Promise.resolve(falha('indisponivel', 'provedor fora'));
  }
}

function consentido(holderId: string, institutionId: string, revogadoEm: Date | null = null, expiraEm?: Date) {
  const base = novoConsent({
    id: `consent-${holderId}-${institutionId}`,
    holderId,
    institutionId,
    connectionId: 'conexao-1',
    scope: 'accounts',
    credentialCipher: 'cifrado',
    agora: AGORA,
  });
  return { ...base, revokedAt: revogadoEm, expiresAt: expiraEm ?? base.expiresAt };
}

class ContasFake implements ExternalAccountRepository {
  async salvarSincronizadas() {}
  async listarDoHolder() { return []; }
}

class LancamentosFake implements RepositorioDeTransactions {
  async buscarDoHolder() {
    return null;
  }

  async salvar() {}

  async listarDoHolder() { return []; }
  async salvarSincronizados() {}
  async deleteByHolder() {}
}

describe('HN-002 — sincronizar instituição (RF-007, RN-012, RN-015)', () => {
  it('RF-007 — consentimento ativo sincroniza, atualiza a última sincronização e conta os dados', async () => {
    const repo = new RepoFake();
    await repo.save(consentido('pessoa-1', 'inst-1'));
    const caso = new SyncInstitutionUseCase(repo, new AggregadorOk(), new ContasFake(), new LancamentosFake());

    const resultado = await caso.executar({ holderId: 'pessoa-1', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });
    expect(resultado).toEqual({ tipo: 'sincronizado', consentId: 'consent-pessoa-1-inst-1', contas: 1, lancamentos: 1 });
    const atualizado = await repo.findById('pessoa-1', 'consent-pessoa-1-inst-1');
    expect(atualizado?.lastSyncAt).toEqual(AGORA);
  });

  it('RN-012 — consentimento revogado não sincroniza', async () => {
    const repo = new RepoFake();
    await repo.save(consentido('pessoa-1', 'inst-1', AGORA));
    const caso = new SyncInstitutionUseCase(repo, new AggregadorOk(), new ContasFake(), new LancamentosFake());

    const resultado = await caso.executar({ holderId: 'pessoa-1', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });
    expect(resultado).toEqual({ tipo: 'sem-consentimento-ativo' });
  });

  it('RN-012 — consentimento expirado equivale a ausente', async () => {
    const repo = new RepoFake();
    await repo.save(consentido('pessoa-1', 'inst-1', null, new Date(AGORA.getTime() - 1_000)));
    const caso = new SyncInstitutionUseCase(repo, new AggregadorOk(), new ContasFake(), new LancamentosFake());

    const resultado = await caso.executar({ holderId: 'pessoa-1', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });
    expect(resultado).toEqual({ tipo: 'sem-consentimento-ativo' });
  });

  it('RN-015 — consentimento de outra pessoa retorna não-encontrado, nunca conteúdo', async () => {
    const repo = new RepoFake();
    await repo.save(consentido('pessoa-1', 'inst-1'));
    const caso = new SyncInstitutionUseCase(repo, new AggregadorOk(), new ContasFake(), new LancamentosFake());

    const resultado = await caso.executar({ holderId: 'pessoa-2', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });
    expect(resultado).toEqual({ tipo: 'nao-encontrado' });
  });

  it('RNF-005 — agregador fora retorna erro estruturado e mantém a última sincronização', async () => {
    const repo = new RepoFake();
    await repo.save({ ...consentido('pessoa-1', 'inst-1'), lastSyncAt: AGORA });
    const caso = new SyncInstitutionUseCase(repo, new AggregadorFora(), new ContasFake(), new LancamentosFake());

    const resultado = await caso.executar({ holderId: 'pessoa-1', consentId: 'consent-pessoa-1-inst-1', agora: AGORA });
    expect(resultado).toEqual({ tipo: 'agregador-indisponivel' });
    const atualizado = await repo.findById('pessoa-1', 'consent-pessoa-1-inst-1');
    expect(atualizado?.lastSyncAt).toEqual(AGORA);
  });
});