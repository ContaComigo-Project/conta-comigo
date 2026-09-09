import { randomUUID } from 'node:crypto';
import type { OpenFinanceAggregator } from '../../aggregation/domain/port/driven/open-finance-aggregator';
import type { ExternalAccountRepository } from '../../transactions/domain/port/driven/external-account-repository';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import type { Transaction } from '../../transactions/domain/model/transaction';
import { MakeDescriptionsReadable } from '../../transactions/application/make-descriptions-readable';
import type { CategorizeTransactions } from '../../transactions/application/categorize-transactions';
import { estaAtivo } from '../domain/model/consent';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import type { ResultadoDaSincronizacao, SyncInstitution, SyncInstitutionInput } from '../domain/port/driving/consent';

// RF-007: synchronize the connected institution. No consent active = no sync
// (RN-012); the consent is always looked up scoped to the holder (RN-015);
// aggregator failure degrades as a structured result, never an exception
// (RNF-005/006). The synced data is persisted: transactions dedup by external
// id (RN-008) and the external accounts snapshot is replaced (RN-009 source).

export const PERIODO_DE_SINCRONIZACAO_DIAS = 90;

export class SyncInstitutionUseCase implements SyncInstitution {
  constructor(
    private readonly repo: ConsentRepository,
    private readonly aggregator: OpenFinanceAggregator,
    private readonly contas: ExternalAccountRepository,
    private readonly lancamentos: RepositorioDeTransactions,
    // HN-004: a limpeza acontece no momento da sincronizacao, nao a cada
    // leitura da tela — o custo se paga uma vez por lancamento novo.
    private readonly legibilizar?: MakeDescriptionsReadable,
    // HN-005: a categoria e derivada da descricao JA legivel, entao esta etapa
    // vem depois da limpeza — nunca antes.
    private readonly categorizar?: CategorizeTransactions,
  ) {}

  async executar(input: SyncInstitutionInput): Promise<ResultadoDaSincronizacao> {
    // RN-015: the consent is looked up BY the holder — a guessed id of another
    // person returns not-found, never content.
    const consent = await this.repo.findById(input.holderId, input.consentId);
    if (!consent) return { tipo: 'nao-encontrado' };

    // RN-012: expired equals absent.
    if (!estaAtivo(consent, input.agora)) return { tipo: 'sem-consentimento-ativo' };

    const desde = new Date(input.agora.getTime() - PERIODO_DE_SINCRONIZACAO_DIAS * 24 * 60 * 60_000);
    const contas = await this.aggregator.listarAccounts(consent.connectionId);
    if (contas.tipo !== 'ok') {
      return contas.motivo === 'indisponivel'
        ? { tipo: 'agregador-indisponivel' }
        : { tipo: 'agregador-recusou', motivo: contas.motivo };
    }

    const lancamentos = await this.aggregator.listarTransactions(consent.connectionId, desde);
    if (lancamentos.tipo !== 'ok') {
      return lancamentos.motivo === 'indisponivel'
        ? { tipo: 'agregador-indisponivel' }
        : { tipo: 'agregador-recusou', motivo: lancamentos.motivo };
    }

    // Persist: external accounts snapshot (RN-009 source) and transactions with
    // dedup by external id (RN-008).
    const holder = input.holderId as HolderId;
    await this.contas.salvarSincronizadas(
      contas.dados.map((c) => ({
        id: randomUUID(),
        holderId: holder,
        externalId: c.idExterno,
        institutionId: c.instituicao,
        type: c.tipo,
        balanceInCents: c.saldoEmCentavos,
      })),
      holder,
    );
    const novos: Transaction[] = lancamentos.dados.map((l) => ({
      id: randomUUID(),
      holderId: holder,
      // O texto do agregador entra como veio e nao e sobrescrito (RN-010).
      description: l.descriptionOriginal,
      readableDescription: null,
      category: null,
      categoryOrigin: null,
      amountInCents: l.amountInCents,
      dueDate: l.dueDate,
      externalId: l.idExterno,
    }));

    // Sem o caso de uso de legibilidade, os lancamentos entram com a descricao
    // crua: a sincronizacao nunca depende da limpeza para acontecer (RNF-005).
    const legiveis = this.legibilizar ? await this.legibilizar.executar(novos) : novos;
    const paraSalvar = this.categorizar ? await this.categorizar.executar(legiveis) : legiveis;

    await this.lancamentos.salvarSincronizados(paraSalvar);

    await this.repo.updateLastSyncAt(consent.id, input.agora);
    return {
      tipo: 'sincronizado',
      consentId: consent.id,
      contas: contas.dados.length,
      lancamentos: lancamentos.dados.length,
    };
  }
}