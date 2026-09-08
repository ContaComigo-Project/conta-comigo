import type { SessionRepository, Session } from '../../domain/port/driven/session-repository';

export class SessionRepositoryMemory implements SessionRepository {
  private readonly porId = new Map<string, Session>();

  async criar(session: Session): Promise<void> {
    this.porId.set(session.id, session);
  }

  async porHashDoRefresh(hash: string): Promise<Session | null> {
    return [...this.porId.values()].find((s) => s.refreshTokenHash === hash) ?? null;
  }

  async revogar(id: string, quando: Date): Promise<void> {
    const session = this.porId.get(id);
    if (session) this.porId.set(id, { ...session, revokedAt: quando });
  }
}
