import type { OpenFinanceAggregator } from '../../aggregation/domain/port/driven/open-finance-aggregator';
import { estaAtivo } from '../domain/model/consent';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import type { ResultadoDaSincronizacao, SyncInstitution, SyncInstitutionInput } from '../domain/port/driving/consent';

// RF-007: synchronize the connected institution. No consent active = no sync
// (RN-012); the consent is always looked up scoped to the holder (RN-015);
// aggregator failure degrades as a structured result, never an exception
// (RNF-005/006). The period requested is the consent window (90 days).

export const PERIODO_DE_SINCRONIZACAO_DIAS = 90;

export class SyncInstitutionUseCase implements SyncInstitution {
  constructor(
    private readonly repo: ConsentRepository,
    private readonly aggregator: OpenFinanceAggregator,
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

    await this.repo.updateLastSyncAt(consent.id, input.agora);
    return {
      tipo: 'sincronizado',
      consentId: consent.id,
      contas: contas.dados.length,
      lancamentos: lancamentos.dados.length,
    };
  }
}