import { InvalidCredentials, type RenovarSession, type SessionAberta } from '../domain/port/driving/access';
import type { TokenIssuer } from '../domain/port/driven/token-issuer';
import type { RepositorioDeAccounts } from '../domain/port/driven/account-repository';
import type { SessionRepository } from '../domain/port/driven/session-repository';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import { refreshTokenHash } from './session';

// Renovar exige session existente, nao revogada e nao expirada. As tres falhas
// dao a MESMA recusa: dizer qual delas ocorreu revelaria se o refresh um dia
// existiu.
export class RenovarSessionUseCase implements RenovarSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly accounts: RepositorioDeAccounts,
    private readonly emissor: TokenIssuer,
    private readonly clock: Clock,
  ) {}

  async executar(refresh: string): Promise<SessionAberta> {
    const session = await this.sessions.porHashDoRefresh(refreshTokenHash(refresh));
    const agora = this.clock.agora();
    if (!session || session.revokedAt !== null || session.expiresAt <= agora) throw new InvalidCredentials();

    const account = await this.accounts.porId(session.holderId);
    if (!account) throw new InvalidCredentials();

    return { account, access: this.emissor.emitir(session.holderId), refresh };
  }
}
