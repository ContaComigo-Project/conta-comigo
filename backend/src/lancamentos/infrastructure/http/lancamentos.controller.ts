import { Controller, Get, Inject } from '@nestjs/common';
import type { ConsultarResumoDoMes } from '../../domain/port/entrada/consultar-resumo-do-mes';
import { TOKENS } from '../../domain/port/saida/tokens';

// Adaptador de entrada. Traduz HTTP para a porta; nao passa objeto de requisicao
// ao caso de uso (ADR-001, regra adicional 4).
@Controller('lancamentos')
export class LancamentosController {
  constructor(@Inject(TOKENS.ConsultarResumoDoMes) private readonly consultar: ConsultarResumoDoMes) {}

  @Get('resumo-do-mes')
  resumoDoMes() {
    return this.consultar.executar();
  }
}
