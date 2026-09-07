import { randomUUID } from 'node:crypto';
import type { Conta } from '../domain/model/conta';
import { email as fazerEmail, EmailInvalido } from '../domain/model/email';
import { CredenciaisInvalidas, type Autenticar, type SessaoAberta } from '../domain/port/entrada/acesso';
import type { EmissorDeToken } from '../domain/port/saida/emissor-de-token';
import type { HashDeSenha } from '../domain/port/saida/hash-de-senha';
import type { RepositorioDeContas } from '../domain/port/saida/repositorio-de-contas';
import type { RepositorioDeSessoes } from '../domain/port/saida/repositorio-de-sessoes';
import type { Relogio } from '../../lancamentos/domain/port/saida/relogio';
import type { TitularId } from '../../lancamentos/domain/model/titular';
import { DURACAO_DO_REFRESH_EM_DIAS, gerarRefresh, hashDoRefresh } from './sessao';

// Hash de uma senha que nao corresponde a nada, usado quando o e-mail nao esta
// cadastrado. Sem ele, o caminho "e-mail inexistente" responderia mais rapido
// que o "senha errada", e o tempo de resposta enumeraria contas (RF-002).
const HASH_DE_COMPARACAO_FALSA = '$2b$04$C4v2xJqZ8kNmL0pR3sT7ue1WxYzAbCdEfGhIjKlMnOpQrStUvWxYa';

export class AutenticarUseCase implements Autenticar {
  constructor(
    private readonly contas: RepositorioDeContas,
    private readonly sessoes: RepositorioDeSessoes,
    private readonly hash: HashDeSenha,
    private readonly emissor: EmissorDeToken,
    private readonly relogio: Relogio,
  ) {}

  async executar(emailEmTexto: string, senhaEmClaro: string): Promise<SessaoAberta> {
    let email;
    try {
      email = fazerEmail(emailEmTexto);
    } catch (erro) {
      if (erro instanceof EmailInvalido) throw new CredenciaisInvalidas();
      throw erro;
    }

    const conta = await this.contas.porEmail(email);
    // A comparacao acontece sempre, mesmo sem conta: e o que iguala os tempos.
    const senhaConfere = await this.hash.conferir(senhaEmClaro, conta?.hashDaSenha ?? HASH_DE_COMPARACAO_FALSA);
    if (!conta || !senhaConfere) throw new CredenciaisInvalidas();

    return this.abrirSessao(conta);
  }

  private async abrirSessao(conta: Conta): Promise<SessaoAberta> {
    const titular = conta.id as TitularId;
    const refresh = gerarRefresh();
    const agora = this.relogio.agora();

    await this.sessoes.criar({
      id: randomUUID(),
      titularId: titular,
      hashDoRefresh: hashDoRefresh(refresh),
      expiraEm: new Date(agora.getTime() + DURACAO_DO_REFRESH_EM_DIAS * 24 * 60 * 60 * 1000),
      revogadoEm: null,
    });

    return { conta, acesso: this.emissor.emitir(titular), refresh };
  }
}
