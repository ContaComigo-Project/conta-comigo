import type { RepositorioDeSessoes, Sessao } from '../../domain/port/saida/repositorio-de-sessoes';

export class RepositorioDeSessoesEmMemoria implements RepositorioDeSessoes {
  private readonly porId = new Map<string, Sessao>();

  async criar(sessao: Sessao): Promise<void> {
    this.porId.set(sessao.id, sessao);
  }

  async porHashDoRefresh(hash: string): Promise<Sessao | null> {
    return [...this.porId.values()].find((s) => s.hashDoRefresh === hash) ?? null;
  }

  async revogar(id: string, quando: Date): Promise<void> {
    const sessao = this.porId.get(id);
    if (sessao) this.porId.set(id, { ...sessao, revogadoEm: quando });
  }
}
