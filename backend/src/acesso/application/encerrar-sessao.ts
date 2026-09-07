import type { EncerrarSessao } from '../domain/port/entrada/acesso';
import type { RepositorioDeSessoes } from '../domain/port/saida/repositorio-de-sessoes';
import type { Relogio } from '../../lancamentos/domain/port/saida/relogio';
import { hashDoRefresh } from './sessao';

// Sair e idempotente e silencioso: refresh desconhecido nao gera erro, porque um
// erro distinguiria "este refresh existiu" de "nunca existiu".
export class EncerrarSessaoUseCase implements EncerrarSessao {
  constructor(
    private readonly sessoes: RepositorioDeSessoes,
    private readonly relogio: Relogio,
  ) {}

  async executar(refresh: string): Promise<void> {
    const sessao = await this.sessoes.porHashDoRefresh(hashDoRefresh(refresh));
    if (sessao && sessao.revogadoEm === null) await this.sessoes.revogar(sessao.id, this.relogio.agora());
  }
}
