import { randomUUID } from 'node:crypto';
import type { OpenFinanceAggregator } from '../../aggregation/domain/port/driven/open-finance-aggregator';
import { novoConsent } from '../domain/model/consent';
import type { CredentialCipher } from '../domain/port/driven/credential-cipher';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import type { ConnectInstitution, ConnectInstitutionInput, ResultadoDaConexao } from '../domain/port/driving/consent';

// RF-004: connect an institution with explicit consent. The consent is a
// first-class record; reconnecting the same institution replaces the previous
// active consent (RN-014). The aggregator credential is ciphered before
// persistence (RNF-014). Aggregator failure returns a structured result, never
// an exception (RNF-005).

export class ConnectInstitutionUseCase implements ConnectInstitution {
  constructor(
    private readonly repo: ConsentRepository,
    private readonly cipher: CredentialCipher,
    private readonly aggregator: OpenFinanceAggregator,
    private readonly agora: () => Date = () => new Date(),
  ) {}

  async executar(input: ConnectInstitutionInput): Promise<ResultadoDaConexao> {
    const resultado = await this.aggregator.criarConexao(input.institutionId);
    if (resultado.tipo !== 'ok') {
      return resultado.motivo === 'indisponivel'
        ? { tipo: 'agregador-indisponivel' }
        : { tipo: 'agregador-recusou', motivo: resultado.motivo };
    }

    // RN-014: one active consent per institution per holder — reconnect replaces.
    const anterior = await this.repo.findActiveByInstitution(input.holderId, input.institutionId, this.agora());
    if (anterior) await this.repo.revoke(anterior.id, this.agora());

    const tokenCifrado = await this.cipher.encrypt(resultado.dados.token);
    const consent = novoConsent({
      id: randomUUID(),
      holderId: input.holderId,
      institutionId: input.institutionId,
      connectionId: resultado.dados.connectionId,
      scope: input.scope,
      credentialCipher: tokenCifrado,
      agora: this.agora(),
    });
    await this.repo.save(consent);
    return { tipo: 'conectada', consent };
  }
}