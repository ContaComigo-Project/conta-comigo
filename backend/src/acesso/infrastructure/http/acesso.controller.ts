import { BadRequestException, Body, Controller, Delete, HttpCode, Inject, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContaDTO, CredenciaisDTO, CriarContaDTO, RenovacaoDTO, type SessaoDTO } from '@contacomigo/contrato';
import type { Autenticar, CriarConta, EncerrarSessao, RenovarSessao } from '../../domain/port/entrada/acesso';
import { CadastroRecusado, CredenciaisInvalidas } from '../../domain/port/entrada/acesso';
import { TOKENS_ACESSO } from '../../domain/port/saida/tokens';
import { zodParaSchema } from '../../../openapi';

// Adaptador de entrada do acesso. As rotas sao publicas por natureza — e a
// unica excecao a guarda do resto do sistema. Decorators Swagger (HT-019) so
// documentam a camada HTTP; nenhum tipo do contrato sai de infrastructure/.
@ApiTags('acesso')
@Controller('acesso')
export class AcessoController {
  constructor(
    @Inject(TOKENS_ACESSO.CriarConta) private readonly criarConta: CriarConta,
    @Inject(TOKENS_ACESSO.Autenticar) private readonly autenticar: Autenticar,
    @Inject(TOKENS_ACESSO.RenovarSessao) private readonly renovar: RenovarSessao,
    @Inject(TOKENS_ACESSO.EncerrarSessao) private readonly encerrar: EncerrarSessao,
  ) {}

  @Post('contas')
  @ApiOperation({ summary: 'Cadastrar conta', description: 'Cria a conta a partir de e-mail e senha. A recusa é uniforme: não revela se o e-mail já existia (RF-001).' })
  @ApiBody({ schema: zodParaSchema(CriarContaDTO), description: 'E-mail e senha de cadastro' })
  @ApiResponse({ status: 201, description: 'Conta criada (sem senha nem hash na resposta)' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou e-mail já cadastrado' })
  async cadastrar(@Body() corpo: unknown): Promise<ContaDTO> {
    const entrada = CriarContaDTO.safeParse(corpo);
    if (!entrada.success) throw new BadRequestException('Dados invalidos.');
    try {
      const conta = await this.criarConta.executar(entrada.data.email, entrada.data.senha);
      return { id: conta.id, email: conta.email };
    } catch (erro) {
      // Recusa uniforme: nao revela se o e-mail ja existia (RF-001).
      if (erro instanceof CadastroRecusado) throw new BadRequestException(erro.message);
      throw erro;
    }
  }

  @Post('sessoes')
  @HttpCode(200)
  @ApiOperation({ summary: 'Entrar (autenticar)', description: 'Autentica com e-mail e senha e devolve uma sessão (JWT curto + refresh revogável).' })
  @ApiBody({ schema: zodParaSchema(CredenciaisDTO), description: 'Credenciais de acesso' })
  @ApiResponse({ status: 200, description: 'Sessão válida' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha inválidos (resposta idêntica para ambos)' })
  async entrar(@Body() corpo: unknown): Promise<SessaoDTO> {
    const entrada = CredenciaisDTO.safeParse(corpo);
    if (!entrada.success) throw new UnauthorizedException('E-mail ou senha invalidos.');
    try {
      const sessao = await this.autenticar.executar(entrada.data.email, entrada.data.senha);
      return {
        conta: { id: sessao.conta.id, email: sessao.conta.email },
        accessToken: sessao.acesso.valor,
        refreshToken: sessao.refresh,
        expiraEm: sessao.acesso.expiraEm.toISOString(),
      };
    } catch (erro) {
      // Mesma resposta para e-mail inexistente e senha errada (RF-002).
      if (erro instanceof CredenciaisInvalidas) throw new UnauthorizedException(erro.message);
      throw erro;
    }
  }

  @Post('sessoes/renovacao')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar sessão', description: 'Troca um refresh token válido por uma sessão nova.' })
  @ApiBody({ schema: zodParaSchema(RenovacaoDTO), description: 'Refresh token emitido na entrada' })
  @ApiResponse({ status: 200, description: 'Sessão renovada' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou revogado' })
  async renovarSessao(@Body() corpo: unknown): Promise<SessaoDTO> {
    const entrada = RenovacaoDTO.safeParse(corpo);
    if (!entrada.success) throw new UnauthorizedException('E-mail ou senha invalidos.');
    try {
      const sessao = await this.renovar.executar(entrada.data.refreshToken);
      return {
        conta: { id: sessao.conta.id, email: sessao.conta.email },
        accessToken: sessao.acesso.valor,
        refreshToken: sessao.refresh,
        expiraEm: sessao.acesso.expiraEm.toISOString(),
      };
    } catch (erro) {
      if (erro instanceof CredenciaisInvalidas) throw new UnauthorizedException(erro.message);
      throw erro;
    }
  }

  @Delete('sessoes')
  @HttpCode(204)
  @ApiOperation({ summary: 'Encerrar sessão', description: 'Invalida o refresh token (RF-003).' })
  @ApiBody({ schema: zodParaSchema(RenovacaoDTO), description: 'Refresh token a revogar' })
  @ApiResponse({ status: 204, description: 'Sessão encerrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sair(@Body() corpo: unknown): Promise<void> {
    const entrada = RenovacaoDTO.safeParse(corpo);
    if (!entrada.success) throw new BadRequestException('Dados invalidos.');
    await this.encerrar.executar(entrada.data.refreshToken);
  }
}
