import { BadRequestException, Body, Controller, Delete, HttpCode, Inject, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AccountDTO, CredentialsDTO, CreateAccountDTO, RefreshDTO, type SessionDTO } from '@contacomigo/contract';
import type { Authenticate, CriarAccount, EncerrarSession, RenovarSession } from '../../domain/port/driving/access';
import { RegistrationRefused, InvalidCredentials } from '../../domain/port/driving/access';
import { TOKENS_ACCESS } from '../../domain/port/driven/tokens';
import { zodParaSchema } from '../../../openapi';

// Nome do cookie httpOnly do refresh token. Nunca em localStorage (ADR-004);
// o cookie é invisível para scripts e viaja sozinho nas requisições (HT-018).
const COOKIE_DE_REFRESH = 'cc_refresh';
const VIDA_DO_COOKIE_MS = 30 * 24 * 60 * 60_000;

function opcoesDoCookie() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: VIDA_DO_COOKIE_MS,
  };
}

// Adaptador de input do access. As routes sao publicas por natureza — e a
// unica excecao a guarda do resto do sistema. Decorators Swagger (HT-019) so
// documentam a camada HTTP; nenhum tipo do contrato sai de infrastructure/.
@ApiTags('access')
@Controller('access')
export class AccessController {
  constructor(
    @Inject(TOKENS_ACCESS.CriarAccount) private readonly criarAccount: CriarAccount,
    @Inject(TOKENS_ACCESS.Authenticate) private readonly authenticate: Authenticate,
    @Inject(TOKENS_ACCESS.RenovarSession) private readonly renovar: RenovarSession,
    @Inject(TOKENS_ACCESS.EncerrarSession) private readonly encerrar: EncerrarSession,
  ) {}

  @Post('accounts')
  @ApiOperation({ summary: 'Cadastrar conta', description: 'Cria a conta a partir de e-mail e senha. A recusa é uniforme: não revela se o e-mail já existia.' })
  @ApiBody({ schema: zodParaSchema(CreateAccountDTO), description: 'E-mail e senha de cadastro' })
  @ApiResponse({ status: 201, description: 'Account criada (sem senha nem hash na response)' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou e-mail já cadastrado' })
  async cadastrar(@Body() body: unknown): Promise<AccountDTO> {
    const input = CreateAccountDTO.safeParse(body);
    if (!input.success) throw new BadRequestException('Dados invalidos.');
    try {
      const account = await this.criarAccount.executar(input.data.email, input.data.senha);
      return { id: account.id, email: account.email };
    } catch (error) {
      // Recusa uniforme: nao revela se o e-mail ja existia (RF-001).
      if (error instanceof RegistrationRefused) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Post('sessions')
  @HttpCode(200)
  @ApiOperation({ summary: 'Entrar (authenticate)', description: 'Autentica com e-mail e senha e devolve uma sessão (JWT curto + refresh revogável).' })
  @ApiBody({ schema: zodParaSchema(CredentialsDTO), description: 'Credenciais de access' })
  @ApiResponse({ status: 200, description: 'Sessão válida' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha inválidos (response idêntica para ambos)' })
  async entrar(@Body() body: unknown, @Res({ passthrough: true }) res: Response): Promise<SessionDTO> {
    const input = CredentialsDTO.safeParse(body);
    if (!input.success) throw new UnauthorizedException('E-mail ou senha invalidos.');
    try {
      const session = await this.authenticate.executar(input.data.email, input.data.senha);
      res.cookie(COOKIE_DE_REFRESH, session.refresh, opcoesDoCookie());
      return {
        account: { id: session.account.id, email: session.account.email },
        accessToken: session.access.valor,
        refreshToken: session.refresh,
        expiresAt: session.access.expiresAt.toISOString(),
      };
    } catch (error) {
      // Mesma response para e-mail inexistente e senha errada (RF-002).
      if (error instanceof InvalidCredentials) throw new UnauthorizedException(error.message);
      throw error;
    }
  }

  @Post('sessions/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar sessão', description: 'Troca um refresh token válido por uma sessão nova.' })
  @ApiBody({ schema: zodParaSchema(RefreshDTO), description: 'Refresh token emitido na input' })
  @ApiResponse({ status: 200, description: 'Sessão renovada' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou revogado' })
  async renovarSession(@Req() req: Request, @Body() body: unknown, @Res({ passthrough: true }) res: Response): Promise<SessionDTO> {
    // O refresh vem do cookie httpOnly quando presente; senão do body (compat).
    const refreshDoCookie = req.cookies?.[COOKIE_DE_REFRESH];
    const refreshToken = refreshDoCookie ?? (() => {
      const parsed = RefreshDTO.safeParse(body);
      if (!parsed.success) throw new UnauthorizedException('E-mail ou senha invalidos.');
      return parsed.data.refreshToken;
    })();
    try {
      const session = await this.renovar.executar(refreshToken);
      res.cookie(COOKIE_DE_REFRESH, session.refresh, opcoesDoCookie());
      return {
        account: { id: session.account.id, email: session.account.email },
        accessToken: session.access.valor,
        refreshToken: session.refresh,
        expiresAt: session.access.expiresAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof InvalidCredentials) throw new UnauthorizedException(error.message);
      throw error;
    }
  }

  @Delete('sessions')
  @HttpCode(204)
  @ApiOperation({ summary: 'Encerrar sessão', description: 'Invalida o refresh token (do cookie ou do body).' })
  @ApiBody({ schema: zodParaSchema(RefreshDTO), description: 'Refresh token a revogar (opcional se vier no cookie)' })
  @ApiResponse({ status: 204, description: 'Sessão encerrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sair(@Req() req: Request, @Body() body: unknown, @Res({ passthrough: true }) res: Response): Promise<void> {
    const refreshDoCookie = req.cookies?.[COOKIE_DE_REFRESH];
    const refreshToken = refreshDoCookie ?? (() => {
      const parsed = RefreshDTO.safeParse(body);
      if (!parsed.success) throw new BadRequestException('Dados invalidos.');
      return parsed.data.refreshToken;
    })();
    await this.encerrar.executar(refreshToken);
    res.clearCookie(COOKIE_DE_REFRESH, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/' });
  }
}
