import { describe, expect, it } from 'vitest';
import type { OpenFinanceAggregator } from '../../aggregation/domain/port/driven/open-finance-aggregator';
import { ok } from '../../aggregation/domain/model/aggregation-result';
import type { AccountExterna, TransactionExterno } from '../../aggregation/domain/model/external-account';
import { estaAtivo, type Consent } from '../domain/model/consent';
import type { CredentialCipher } from '../domain/port/driven/credential-cipher';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import { ConnectInstitutionUseCase } from './connect-institution';

const AGORA = new Date('2026-09-07T12:00:00Z');

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
}

class AggregadorFake implements OpenFinanceAggregator {
  async criarConexao(instituicaoId: string) {
    return ok({ connectionId: `conexao-${instituicaoId}`, token: `token-sintetico-${instituicaoId}` });
  }
  async listarAccounts() { return ok([] as readonly AccountExterna[]); }
  async listarTransactions() { return ok([] as readonly TransactionExterno[]); }
}

class FakeCipher implements CredentialCipher {
  cifrados: string[] = [];
  async encrypt(plaintext: string): Promise<string> {
    const c = `cifrado:${plaintext}`;
    this.cifrados.push(c);
    return c;
  }
  async decrypt(ciphertext: string): Promise<string> {
    return ciphertext.replace(/^cifrado:/, '');
  }
}

describe('HN-002 — conectar instituição com consentimento (RF-004, RN-014)', () => {
  it('RF-004 — cria um consentimento ativo e cifra a credencial do agregador', async () => {
    const repo = new RepoFake();
    const cipher = new FakeCipher();
    const caso = new ConnectInstitutionUseCase(repo, cipher, new AggregadorFake(), () => AGORA);

    const resultado = await caso.executar({ holderId: 'pessoa-1', institutionId: 'inst-1', scope: 'accounts' });

    expect(resultado.tipo).toBe('conectada');
    if (resultado.tipo !== 'conectada') return;
    expect(resultado.consent.holderId).toBe('pessoa-1');
    expect(estaAtivo(resultado.consent, AGORA)).toBe(true);
    // RNF-014: o que foi persistido é o resultado do cipher, nunca o token em claro.
    expect(resultado.consent.credentialCipher).toBe('cifrado:token-sintetico-inst-1');
    expect(cipher.cifrados).toHaveLength(1);
  });

  it('RN-014 — reconectar a mesma instituição substitui o consentimento anterior', async () => {
    const repo = new RepoFake();
    const caso = new ConnectInstitutionUseCase(repo, new FakeCipher(), new AggregadorFake(), () => AGORA);

    await caso.executar({ holderId: 'pessoa-1', institutionId: 'inst-1', scope: 'accounts' });
    const segunda = await caso.executar({ holderId: 'pessoa-1', institutionId: 'inst-1', scope: 'accounts-and-transactions' });

    expect(segunda.tipo).toBe('conectada');
    const ativosAgora = (await repo.listByHolder('pessoa-1')).filter((c) => estaAtivo(c, AGORA));
    expect(ativosAgora.length).toBe(1);
    if (segunda.tipo !== 'conectada') return;
    expect(ativosAgora[0].id).toBe(segunda.consent.id);
  });

  it('a conexão de outra instituição não toca o consentimento existente', async () => {
    const repo = new RepoFake();
    const caso = new ConnectInstitutionUseCase(repo, new FakeCipher(), new AggregadorFake(), () => AGORA);

    await caso.executar({ holderId: 'pessoa-1', institutionId: 'inst-1', scope: 'accounts' });
    await caso.executar({ holderId: 'pessoa-1', institutionId: 'inst-2', scope: 'accounts' });

    const ativos = (await repo.listByHolder('pessoa-1')).filter((c) => estaAtivo(c, AGORA));
    expect(ativos.length).toBe(2);
  });
});