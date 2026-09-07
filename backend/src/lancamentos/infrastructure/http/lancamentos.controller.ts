import { Controller, Get, Inject } from '@nestjs/common';
import { ok, type LancamentoDTO, type Resultado } from '@contacomigo/contrato';
import { paraLancamentoDTO } from './lancamento.dto';
import type { ConsultarResumoDoMes } from '../../domain/port/entrada/consultar-resumo-do-mes';
import type { ListarLancamentos } from '../../domain/port/entrada/listar-lancamentos';
import { TOKENS } from '../../domain/port/saida/tokens';

// Adaptador de entrada. Traduz HTTP para a porta; nao passa objeto de requisicao
// ao caso de uso (ADR-001, regra adicional 4).
@Controller('lancamentos')
export class LancamentosController {
  constructor(
    @Inject(TOKENS.ConsultarResumoDoMes) private readonly consultar: ConsultarResumoDoMes,
    @Inject(TOKENS.ListarLancamentos) private readonly listar: ListarLancamentos,
  ) {}

  @Get('resumo-do-mes')
  resumoDoMes() {
    return this.consultar.executar();
  }

  // Resposta no CONTRATO (HT-017): Resultado<LancamentoDTO[]>. O envelope e
  // quem carrega erro e "dados insuficientes" quando eles existirem.
  @Get()
  async lancamentos(): Promise<Resultado<LancamentoDTO[]>> {
    const lancamentos = await this.listar.executar();
    return ok(lancamentos.map(paraLancamentoDTO));
  }
}
