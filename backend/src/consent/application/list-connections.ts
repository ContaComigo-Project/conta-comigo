import type { Consent } from '../domain/model/consent';
import type { ConsentRepository } from '../domain/port/driven/consent-repository';
import type { ListConnections } from '../domain/port/driving/consent';

// RF-005: list the holder's connected institutions. Always scoped to the holder
// (RN-015): there is no "list all" path in this system.

export class ListConnectionsUseCase implements ListConnections {
  constructor(private readonly repo: ConsentRepository) {}

  executar(holderId: string): Promise<readonly Consent[]> {
    return this.repo.listByHolder(holderId);
  }
}