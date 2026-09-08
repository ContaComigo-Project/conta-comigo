import type { EncerrarSession } from '../domain/port/driving/access';
import type { SessionRepository } from '../domain/port/driven/session-repository';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import { refreshTokenHash } from './session';

// Sair e idempotente e silencioso: refresh desconhecido nao gera error, porque um
// error distinguiria "este refresh existiu" de "nunca existiu".
export class EncerrarSessionUseCase implements EncerrarSession {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly clock: Clock,
  ) {}

  async executar(refresh: string): Promise<void> {
    const session = await this.sessions.porHashDoRefresh(refreshTokenHash(refresh));
    if (session && session.revokedAt === null) await this.sessions.revogar(session.id, this.clock.agora());
  }
}
