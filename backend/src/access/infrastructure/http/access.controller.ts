import { BadRequestException, Body, Controller, Delete, HttpCode, Inject, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountDTO, CredentialsDTO, CreateAccountDTO, RefreshDTO, type SessionDTO } from '@contacomigo/contract';
import type { Authenticate, CriarAccount, EncerrarSession, RenovarSession } from '../../domain/port/driving/access';
import { RegistrationRefused, InvalidCredentials } from '../../domain/port/driving/access';
import { TOKENS_ACCESS } from '../../domain/port/driven/tokens';
import { zodParaSchema } from '../../../openapi';

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
  @ApiOperation({ summary: 'Cadastrar account', description: 'Cria a account a partir de e-mail e senha. A recusa é uniforme: não revela se o e-mail já existia (RF-001).' })
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
  async entrar(@Body() body: unknown): Promise<SessionDTO> {
    const input = CredentialsDTO.safeParse(body);
    if (!input.success) throw new UnauthorizedException('E-mail ou senha invalidos.');
    try {
      const session = await this.authenticate.executar(input.data.email, input.data.senha);
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
  async renovarSession(@Body() body: unknown): Promise<SessionDTO> {
    const input = RefreshDTO.safeParse(body);
    if (!input.success) throw new UnauthorizedException('E-mail ou senha invalidos.');
    try {
      const session = await this.renovar.executar(input.data.refreshToken);
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
  @ApiOperation({ summary: 'Encerrar sessão', description: 'Invalida o refresh token (RF-003).' })
  @ApiBody({ schema: zodParaSchema(RefreshDTO), description: 'Refresh token a revogar' })
  @ApiResponse({ status: 204, description: 'Sessão encerrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sair(@Body() body: unknown): Promise<void> {
    const input = RefreshDTO.safeParse(body);
    if (!input.success) throw new BadRequestException('Dados invalidos.');
    await this.encerrar.executar(input.data.refreshToken);
  }
}
