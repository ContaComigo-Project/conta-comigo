import { Controller, Get, Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ok, type LancamentoDTO, type Resultado } from '@contacomigo/contrato';
import type { ConsultarResumoDoMes } from '../../domain/port/entrada/consultar-resumo-do-mes';
import type { ListarLancamentos } from '../../domain/port/entrada/listar-lancamentos';
import type { Identidade } from '../../domain/port/saida/identidade';
import { GuardaDeTitular } from './guarda-de-titular';
import { TOKENS } from '../../domain/port/saida/tokens';
import { paraLancamentoDTO } from './lancamento.dto';

// Adaptador de entrada. Traduz HTTP para a porta; nao passa objeto de requisicao
// ao caso de uso (ADR-001, regra adicional 4). O titular vem da Identidade,
// NUNCA de parametro da requisicao (RN-015). Decorators Swagger (HT-019)
// documentam a exigencia de Bearer (guarda de titular, RNF-013).
@ApiTags('lancamentos')
@ApiBearerAuth()
@Controller('lancamentos')
@UseGuards(GuardaDeTitular)
export class LancamentosController {
  constructor(
    @Inject(TOKENS.ConsultarResumoDoMes) private readonly consultar: ConsultarResumoDoMes,
    @Inject(TOKENS.ListarLancamentos) private readonly listar: ListarLancamentos,
    @Inject(TOKENS.Identidade) private readonly identidade: Identidade,
  ) {}

  // A guarda ja recusou a requisicao sem titular; aqui o null so aconteceria
  // se alguem removesse a guarda — e entao falhar alto e o comportamento certo.
  private titular() {
    const titular = this.identidade.titularAtual();
    if (titular === null) throw new UnauthorizedException();
    return titular;
  }

  @Get('resumo-do-mes')
  @ApiOperation({ summary: 'Resumo do mês', description: 'Resumo consolidado dos lançamentos do mês de referência do titular (RN-003).' })
  @ApiResponse({ status: 200, description: 'Resumo do mês' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  resumoDoMes() {
    return this.consultar.executar(this.titular());
  }

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos', description: 'Lista os lançamentos do titular autenticado (RN-015).' })
  @ApiResponse({ status: 200, description: 'Lançamentos do titular' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  async lancamentos(): Promise<Resultado<LancamentoDTO[]>> {
    const lancamentos = await this.listar.executar(this.titular());
    return ok(lancamentos.map(paraLancamentoDTO));
  }
}
