import { CredenciaisInvalidas, type RenovarSessao, type SessaoAberta } from '../domain/port/entrada/acesso';
import type { EmissorDeToken } from '../domain/port/saida/emissor-de-token';
import type { RepositorioDeContas } from '../domain/port/saida/repositorio-de-contas';
import type { RepositorioDeSessoes } from '../domain/port/saida/repositorio-de-sessoes';
import type { Relogio } from '../../lancamentos/domain/port/saida/relogio';
import { hashDoRefresh } from './sessao';

// Renovar exige sessao existente, nao revogada e nao expirada. As tres falhas
// dao a MESMA recusa: dizer qual delas ocorreu revelaria se o refresh um dia
// existiu.
export class RenovarSessaoUseCase implements RenovarSessao {
  constructor(
    private readonly sessoes: RepositorioDeSessoes,
    private readonly contas: RepositorioDeContas,
    private readonly emissor: EmissorDeToken,
    private readonly relogio: Relogio,
  ) {}

  async executar(refresh: string): Promise<SessaoAberta> {
    const sessao = await this.sessoes.porHashDoRefresh(hashDoRefresh(refresh));
    const agora = this.relogio.agora();
    if (!sessao || sessao.revogadoEm !== null || sessao.expiraEm <= agora) throw new CredenciaisInvalidas();

    const conta = await this.contas.porId(sessao.titularId);
    if (!conta) throw new CredenciaisInvalidas();

    return { conta, acesso: this.emissor.emitir(sessao.titularId), refresh };
  }
}
