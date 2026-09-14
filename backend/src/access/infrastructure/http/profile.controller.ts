import { Controller, Get, Inject, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountProfileDTO } from '@contacomigo/contract';
import type { RepositorioDeAccounts } from '../../domain/port/driven/account-repository';
import type { TokenIssuer } from '../../domain/port/driven/token-issuer';
import { TOKENS_ACCESS } from '../../domain/port/driven/tokens';

// Perfil do titular autenticado (HN-001). O nome vem do banco (Account.name);
// o holder é derivado do access token — forjar o cabeçalho não basta (ADR-004).
@ApiTags('access')
@ApiBearerAuth()
@Controller('access')
export class ProfileController {
  constructor(
    @Inject(TOKENS_ACCESS.TokenIssuer) private readonly emissor: TokenIssuer,
    @Inject(TOKENS_ACCESS.RepositorioDeAccounts) private readonly contas: RepositorioDeAccounts,
  ) {}

  private holderDoCabecalho(cabecalho: unknown): string {
    const valor = Array.isArray(cabecalho) ? cabecalho[0] : cabecalho;
    if (typeof valor !== 'string') throw new UnauthorizedException();
    const [esquema, token] = valor.split(' ');
    if (esquema?.toLowerCase() !== 'bearer' || !token) throw new UnauthorizedException();
    const holder = this.emissor.validar(token);
    if (holder === null) throw new UnauthorizedException();
    return holder;
  }

  @Get('accounts/me')
  @ApiOperation({ summary: 'Perfil do titular', description: 'Nome e e-mail do titular autenticado (o nome vem do banco).' })
  @ApiResponse({ status: 200, description: 'Perfil do titular' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  async perfil(@Req() req: { headers?: Record<string, unknown> }): Promise<AccountProfileDTO> {
    const holder = this.holderDoCabecalho(req.headers?.authorization);
    const conta = await this.contas.porId(holder);
    if (!conta) throw new UnauthorizedException();
    return { id: conta.id, email: conta.email, name: conta.name, createdAt: (conta.createdAt ?? new Date(0)).toISOString() };
  }
}