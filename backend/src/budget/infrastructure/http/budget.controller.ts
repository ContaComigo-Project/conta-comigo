import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BudgetHistoryDTO, BudgetSemaphoreDTO, DefinirLimiteDTO, DiagnosisDTO, ResultadoSimulacaoDTO, SimulacaoDTO, ok, type MonthlyLimitDTO, type Result } from '@contacomigo/contract';
import { zodParaSchema } from '../../../openapi';
import type { Identity } from '../../../transactions/domain/port/driven/identity';
import type { ListMonthlyLimits } from '../../application/list-monthly-limits';
import type { RemoveMonthlyLimit } from '../../application/remove-monthly-limit';
import type { SetMonthlyLimit } from '../../application/set-monthly-limit';
import type { GetBudgetHistory } from '../../domain/port/driving/get-budget-history';
import type { GetDiagnosis } from '../../domain/port/driving/get-diagnosis';
import type { SimularPlanoDeCompra } from '../../domain/port/driving/simulate-purchase';
import { ExportarRelatorioPDF } from '../../application/export-relatorio-pdf';
import type { GetBudgetSemaphore } from '../../domain/port/driving/get-budget-semaphore';
import { TOKENS_BUDGET } from '../../domain/port/driven/tokens';
import { GuardaDeHolderDoBudget, TOKEN_IDENTITY_BUDGET } from './holder-guard';

// Adapter de entrada do orcamento (HN-006/007). O titular vem do access token,
// nunca de parametro da requisicao (RN-015): nao existe rota que aceite os
// limites de outra pessoa. A rota estatica `semaphore` vem ANTES de `:month`
// para o roteador nao capturar a palavra como mes.
@ApiTags('budget')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(GuardaDeHolderDoBudget)
export class BudgetController {
  constructor(
    @Inject(TOKENS_BUDGET.SetMonthlyLimit) private readonly definir: SetMonthlyLimit,
    @Inject(TOKENS_BUDGET.RemoveMonthlyLimit) private readonly remover: RemoveMonthlyLimit,
    @Inject(TOKENS_BUDGET.ListMonthlyLimits) private readonly listar: ListMonthlyLimits,
    @Inject(TOKENS_BUDGET.GetBudgetSemaphore) private readonly calcularSemaforo: GetBudgetSemaphore,
    @Inject(TOKENS_BUDGET.GetBudgetHistory) private readonly historico: GetBudgetHistory,
    @Inject(TOKENS_BUDGET.GetDiagnosis) private readonly diagnostico: GetDiagnosis,
    @Inject(TOKENS_BUDGET.SimularPlanoDeCompra) private readonly simular: SimularPlanoDeCompra,
    @Inject(TOKENS_BUDGET.ExportarRelatorioPDF) private readonly relatorio: ExportarRelatorioPDF,
    @Inject(TOKEN_IDENTITY_BUDGET) private readonly identity: Identity,
  ) {}

  private titular(): string {
    const titular = this.identity.holderAtual();
    if (titular === null) throw new UnauthorizedException();
    return titular;
  }

  @Get('semaphore')
  @ApiOperation({ summary: 'Semáforo do orçamento', description: 'Faixa por categoria no mês (RN-001) e avisos de cruzamento emitidos (RN-005).' })
  @ApiResponse({ status: 200, description: 'Semáforo do mês' })
  @ApiResponse({ status: 400, description: 'Mês inválido' })
  async semaforo(@Query('month') month: string): Promise<BudgetSemaphoreDTO> {
    try {
      const r = await this.calcularSemaforo.executar(this.titular(), month);
      return { month: r.month, categorias: [...r.categorias], alertas: [...r.alertas] };
    } catch {
      throw new BadRequestException('Mês inválido (esperado AAAA-MM).');
    }
  }

  @Get('diagnosis')
  @ApiOperation({ summary: 'Diagnóstico de saúde financeira', description: 'Diagnóstico a partir dos dados consolidados (RN-019); degrada em resultado estruturado quando a IA não responde (RN-021).' })
  @ApiResponse({ status: 200, description: 'Diagnóstico (ou estado de degradação)' })
  async diagnosticoFinanceiro(): Promise<DiagnosisDTO> {
    const r = await this.diagnostico.executar(this.titular());
    switch (r.tipo) {
      case 'ok':
        return { estado: 'ok', analises: r.analises.map((a) => ({ id: a.id, titulo: a.titulo, texto: a.texto })) };
      case 'dados-insuficientes':
        return { estado: 'dados-insuficientes' };
      case 'ia-indisponivel':
        return { estado: 'ia-indisponivel', motivo: r.motivo };
      case 'teto-atingido':
        return { estado: 'teto-atingido' };
      case 'ia-bloqueou':
        return { estado: 'ia-bloqueou', motivo: r.motivo };
    }
  }

  @Post('simulation')
  @ApiOperation({ summary: 'Simular impacto no orçamento', description: 'RF-022: impacto de um valor na categoria no semáforo do mês. Nunca recomenda crédito (RN-017).' })
  @ApiResponse({ status: 200, description: 'Impacto por categoria' })
  async simularCompra(@Body() body: SimulacaoDTO): Promise<ResultadoSimulacaoDTO> {
    const r = await this.simular.executar(this.titular(), body.categoria, body.valorEmCentavos, body.month);
    return { month: r.month, categorias: [...r.categorias] };
  }

  @Get('report.pdf')
  @ApiOperation({ summary: 'Relatório em PDF', description: 'RF-023: relatório do mês (via query month) ou do histórico, com os mesmos números do painel (RN-019).' })
  @ApiResponse({ status: 200, description: 'Arquivo PDF' })
  async relatorioPDF(@Query('month') month: string | undefined, @Res() res: Response) {
    const buffer = await this.relatorio.executar(this.titular(), month);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="relatorio-orcamento.pdf"');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de 6 meses', description: 'Histórico por categoria dos meses fechados (RN-022) e os três problemas mais recorrentes (RN-023).' })
  @ApiResponse({ status: 200, description: 'Histórico do titular' })
  async historicoMeses(): Promise<BudgetHistoryDTO> {
    const r = await this.historico.executar(this.titular());
    return {
      meses: r.meses.map((m) => ({ month: m.month, categorias: [...m.categorias] })),
      problemas: [...r.problemas],
    };
  }

  @Get(':month')
  @ApiOperation({ summary: 'Limites do mês', description: 'Lista os limites por categoria do titular no mês de referência.' })
  @ApiResponse({ status: 200, description: 'Limites do mês' })
  @ApiResponse({ status: 400, description: 'Mês de referência inválido' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  async limitesDoMes(@Param('month') month: string): Promise<Result<MonthlyLimitDTO[]>> {
    const resultado = await this.listar.executar({ holderId: this.titular(), month });
    if (resultado.tipo === 'invalido') throw new BadRequestException(resultado.motivo);

    return ok(
      resultado.limites.map((l) => ({ month: l.month, category: l.category, limiteEmCents: l.limitInCents })),
    );
  }

  @Put(':month/:category')
  @ApiOperation({ summary: 'Definir limite', description: 'Define ou substitui o limite mensal da categoria. Valor em centavos.' })
  @ApiBody({ schema: zodParaSchema(DefinirLimiteDTO), description: 'Limite em centavos' })
  @ApiResponse({ status: 200, description: 'Limite definido' })
  @ApiResponse({ status: 400, description: 'Mês, categoria ou valor inválido' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  async definirLimite(
    @Param('month') month: string,
    @Param('category') category: string,
    @Body() corpo: unknown,
  ): Promise<Result<MonthlyLimitDTO>> {
    const entrada = DefinirLimiteDTO.safeParse(corpo);
    if (!entrada.success) throw new BadRequestException('limite ausente ou invalido');

    const resultado = await this.definir.executar({
      holderId: this.titular(),
      month,
      category,
      limitInCents: entrada.data.limiteEmCents,
    });
    if (resultado.tipo === 'invalido') throw new BadRequestException(resultado.motivo);

    return ok({ month, category, limiteEmCents: entrada.data.limiteEmCents });
  }

  @Delete(':month/:category')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remover limite',
    description: 'Remove o limite da categoria no mês: a categoria volta ao estado sem limite (RN-002), que não é o mesmo que limite zero.',
  })
  @ApiResponse({ status: 204, description: 'Limite removido' })
  @ApiResponse({ status: 400, description: 'Mês ou categoria inválido' })
  @ApiResponse({ status: 404, description: 'Não havia limite definido' })
  async removerLimite(@Param('month') month: string, @Param('category') category: string): Promise<void> {
    const resultado = await this.remover.executar({ holderId: this.titular(), month, category });
    if (resultado.tipo === 'invalido') throw new BadRequestException(resultado.motivo);
    if (resultado.tipo === 'nao-encontrado') throw new NotFoundException();
  }
}