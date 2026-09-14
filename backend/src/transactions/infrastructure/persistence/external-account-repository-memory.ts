import type { ExternalAccount } from '../../domain/model/external-account';
import type { ExternalAccountRepository } from '../../domain/port/driven/external-account-repository';
import type { HolderId } from '../../domain/model/holder';

export class ExternalAccountRepositoryMemory implements ExternalAccountRepository {
  private readonly dados: ExternalAccount[] = [];

  async salvarSincronizadas(contas: readonly ExternalAccount[], holderId: HolderId): Promise<void> {
    const restantes = this.dados.filter((c) => c.holderId !== holderId);
    this.dados.length = 0;
    this.dados.push(...restantes, ...contas);
  }

  async listarDoHolder(holderId: HolderId): Promise<readonly ExternalAccount[]> {
    return this.dados.filter((c) => c.holderId === holderId);
  }
}