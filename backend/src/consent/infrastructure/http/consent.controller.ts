import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConnectInstitutionDTO, ConsentDTO, SyncResultDTO } from '@contacomigo/contract';
import type { HolderId } from '../../../transactions/domain/model/holder';
import { TOKENS_CONSENT } from '../../domain/port/driven/consent-repository';
import type { Identity } from '../../domain/port/driven/identity';
import type { ConnectInstitution, ListConnections, SyncInstitution } from '../../domain/port/driving/consent';
import type { RevokeConsentUseCase } from '../../application/revoke-consent';
import type { DeleteAccountUseCase } from '../../application/delete-account';
import { zodParaSchema } from '../../../openapi';
import { HolderGuard } from './holder-guard';
import { paraConsentDTO } from './consent.dto';

// Adapter de entrada do consentimento (HN-002). Rotas protegidas pela barreira
// de RNF-013; o holder vem do access token, nunca de parametro (RN-015).
@ApiTags('consent')
@ApiBearerAuth()
@Controller('consents')
@UseGuards(HolderGuard)
export class ConsentController {
  constructor(
    @Inject(TOKENS_CONSENT.ConnectInstitution) private readonly conectar: ConnectInstitution,
    @Inject(TOKENS_CONSENT.ListConnections) private readonly listar: ListConnections,
    @Inject(TOKENS_CONSENT.SyncInstitution) private readonly sincronizar: SyncInstitution,
    @Inject(TOKENS_CONSENT.RevokeConsent) private readonly revogar: RevokeConsentUseCase,
    @Inject(TOKENS_CONSENT.DeleteAccount) private readonly excluirConta: DeleteAccountUseCase,
    @Inject(TOKENS_CONSENT.Identity) private readonly identidade: Identity,
  ) {}

  private titular(): HolderId {
    const titular = this.identidade.holderAtual();
    if (titular === null) throw new UnauthorizedException();
    return titular;
  }

  @Post()
  @ApiOperation({ summary: 'Conectar instituição', description: 'Cria um consentimento ativo para a instituição, substituindo o anterior da mesma instituição.' })
  @ApiBody({ schema: zodParaSchema(ConnectInstitutionDTO), description: 'Instituição e escopo autorizados' })
  @ApiResponse({ status: 201, description: 'Consentimento criado' })
  @ApiResponse({ status: 503, description: 'Agregador indisponível' })
  async conectarInstituicao(@Body() corpo: unknown): Promise<ConsentDTO> {
    const entrada = ConnectInstitutionDTO.safeParse(corpo);
    if (!entrada.success) throw new BadRequestException('Dados invalidos.');

    const resultado = await this.conectar.executar({
      holderId: this.titular(),
      institutionId: entrada.data.institutionId,
      scope: entrada.data.scope,
    });
    switch (resultado.tipo) {
      case 'conectada':
        return paraConsentDTO(resultado.consent, new Date());
      case 'agregador-indisponivel':
        throw new ServiceUnavailableException('Agregador indisponivel.');
      case 'agregador-recusou':
        throw new BadGatewayException('O agregador recusou a conexao.');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar instituições conectadas', description: 'Lista os consentimentos do titular com status e última sincronização.' })
  @ApiResponse({ status: 200, description: 'Consentimentos do titular' })
  async listarConexoes(): Promise<ConsentDTO[]> {
    const agora = new Date();
    return (await this.listar.executar(this.titular())).map((c) => paraConsentDTO(c, agora));
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sincronizar instituição', description: 'Sincroniza contas e lançamentos do período suportado, apenas com consentimento ativo.' })
  @ApiResponse({ status: 200, description: 'Sincronização concluída' })
  @ApiResponse({ status: 404, description: 'Consentimento não encontrado para o titular' })
  @ApiResponse({ status: 409, description: 'Sem consentimento ativo' })
  @ApiResponse({ status: 503, description: 'Agregador indisponível' })
  async sincronizarInstituicao(@Param('id') id: string): Promise<SyncResultDTO> {
    const resultado = await this.sincronizar.executar({
      holderId: this.titular(),
      consentId: id,
      agora: new Date(),
    });
    switch (resultado.tipo) {
      case 'sincronizado':
        return { consentId: resultado.consentId, contas: resultado.contas, lancamentos: resultado.lancamentos };
      case 'sem-consentimento-ativo':
        throw new ConflictException('Sem consentimento ativo.');
      case 'nao-encontrado':
        throw new NotFoundException();
      case 'agregador-indisponivel':
        throw new ServiceUnavailableException('Agregador indisponivel.');
      case 'agregador-recusou':
        throw new BadGatewayException('O agregador recusou a sincronizacao.');
    }
  }

  @Delete('account')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir conta e dados', description: 'Apaga a conta, sessões, consentimentos e transações do titular (RN-016).' })
  @ApiResponse({ status: 204, description: 'Conta excluída' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async excluirMinhaConta(): Promise<void> {
    const resultado = await this.excluirConta.executar(this.titular());
    if (resultado.tipo === 'nao-encontrada') throw new NotFoundException();
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revogar consentimento', description: 'Tira a instituição do painel imediatamente e agenda a exclusão definitiva em até 24h (RN-013).' })
  @ApiResponse({ status: 204, description: 'Consentimento revogado' })
  @ApiResponse({ status: 404, description: 'Consentimento não encontrado para o titular' })
  async revogarConsentimento(@Param('id') id: string): Promise<void> {
    const resultado = await this.revogar.executar({ holderId: this.titular(), consentId: id, agora: new Date() });
    if (resultado.tipo === 'nao-encontrado') throw new NotFoundException();
  }
}