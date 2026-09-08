import { randomUUID } from 'node:crypto';
import type { Account } from '../domain/model/account';
import { email as fazerEmail, EmailInvalido } from '../domain/model/email';
import { InvalidCredentials, type Authenticate, type SessionAberta } from '../domain/port/driving/access';
import type { TokenIssuer } from '../domain/port/driven/token-issuer';
import type { PasswordHasher } from '../domain/port/driven/password-hasher';
import type { RepositorioDeAccounts } from '../domain/port/driven/account-repository';
import type { SessionRepository } from '../domain/port/driven/session-repository';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { HolderId } from '../../transactions/domain/model/holder';
import { DURACAO_DO_REFRESH_EM_DIAS, gerarRefresh, refreshTokenHash } from './session';

// Hash de uma senha que nao corresponde a nada, usado quando o e-mail nao esta
// cadastrado. Sem ele, o caminho "e-mail inexistente" responderia mais rapido
// que o "senha errada", e o tempo de response enumeraria accounts (RF-002).
const HASH_DE_COMPARACAO_FALSA = '$2b$04$C4v2xJqZ8kNmL0pR3sT7ue1WxYzAbCdEfGhIjKlMnOpQrStUvWxYa';

export class AuthenticateUseCase implements Authenticate {
  constructor(
    private readonly accounts: RepositorioDeAccounts,
    private readonly sessions: SessionRepository,
    private readonly hash: PasswordHasher,
    private readonly emissor: TokenIssuer,
    private readonly clock: Clock,
  ) {}

  async executar(emailEmTexto: string, senhaEmClaro: string): Promise<SessionAberta> {
    let email;
    try {
      email = fazerEmail(emailEmTexto);
    } catch (error) {
      if (error instanceof EmailInvalido) throw new InvalidCredentials();
      throw error;
    }

    const account = await this.accounts.porEmail(email);
    // A comparacao acontece sempre, mesmo sem account: e o que iguala os tempos.
    const senhaConfere = await this.hash.conferir(senhaEmClaro, account?.passwordHash ?? HASH_DE_COMPARACAO_FALSA);
    if (!account || !senhaConfere) throw new InvalidCredentials();

    return this.abrirSession(account);
  }

  private async abrirSession(account: Account): Promise<SessionAberta> {
    const holder = account.id as HolderId;
    const refresh = gerarRefresh();
    const agora = this.clock.agora();

    await this.sessions.criar({
      id: randomUUID(),
      holderId: holder,
      refreshTokenHash: refreshTokenHash(refresh),
      expiresAt: new Date(agora.getTime() + DURACAO_DO_REFRESH_EM_DIAS * 24 * 60 * 60 * 1000),
      revokedAt: null,
    });

    return { account, access: this.emissor.emitir(holder), refresh };
  }
}
