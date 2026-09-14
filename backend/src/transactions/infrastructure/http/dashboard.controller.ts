import { Controller, Get, Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConsolidatedSummaryDTO } from '@contacomigo/contract';
import type { HolderId } from '../../domain/model/holder';
import type { GetConsolidatedSummary } from '../../domain/port/driving/consolidated-summary';
import type { Identity } from '../../domain/port/driven/identity';
import { TOKENS } from '../../domain/port/driven/tokens';
import { GuardaDeHolder } from './holder-guard';

// RF-008 / RF-009: the consolidated panel. Protected by the holder barrier
// (RNF-013); the holder comes from the access token, never from params (RN-015).
@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(GuardaDeHolder)
export class DashboardController {
  constructor(
    @Inject(TOKENS.GetConsolidatedSummary) private readonly resumo: GetConsolidatedSummary,
    @Inject(TOKENS.Identity) private readonly identidade: Identity,
  ) {}

  private titular(): HolderId {
    const titular = this.identidade.holderAtual();
    if (titular === null) throw new UnauthorizedException();
    return titular;
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo consolidado', description: 'Saldo total (contas ativas), fatura do cartão separada e métricas do mês.' })
  @ApiResponse({ status: 200, description: 'Resumo consolidado do titular' })
  async resumoConsolidado(): Promise<ConsolidatedSummaryDTO> {
    return this.resumo.executar(this.titular());
  }
}