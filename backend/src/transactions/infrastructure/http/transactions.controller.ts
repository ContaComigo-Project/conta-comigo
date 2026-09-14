import { BadRequestException, Body, Controller, Get, Header, Inject, NotFoundException, Param, Patch, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CorrigirCategoriaDTO, ok, type TransactionDTO, type Result } from '@contacomigo/contract';
import type { GetMonthSummary } from '../../domain/port/driving/month-summary';
import type { ListarTransactions } from '../../domain/port/driving/list-transactions';
import type { Identity } from '../../domain/port/driven/identity';
import type { CorrectCategory } from '../../application/correct-category';
import { GuardaDeHolder } from './holder-guard';
import { TOKENS } from '../../domain/port/driven/tokens';
import { ExportarLancamentosCSV } from '../../application/export-lancamentos-csv';
import { paraTransactionDTO } from './transaction.dto';

// Adaptador de input. Traduz HTTP para a porta; nao passa objeto de requisicao
// ao caso de uso (ADR-001, regra adicional 4). O holder vem da Identity,
// NUNCA de parametro da requisicao (RN-015). Decorators Swagger (HT-019)
// documentam a exigencia de Bearer (guarda de holder, RNF-013).
@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(GuardaDeHolder)
export class TransactionsController {
  constructor(
    @Inject(TOKENS.GetMonthSummary) private readonly consultar: GetMonthSummary,
    @Inject(TOKENS.ListarTransactions) private readonly listar: ListarTransactions,
    @Inject(TOKENS.Identity) private readonly identity: Identity,
    @Inject(TOKENS.CorrectCategory) private readonly corrigirCategoria: CorrectCategory,
    @Inject(TOKENS.ExportarLancamentosCSV) private readonly exportadorCSV: ExportarLancamentosCSV,
  ) {}

  // A guarda ja recusou a requisicao sem holder; aqui o null so aconteceria
  // se alguem removesse a guarda — e entao falhar alto e o comportamento certo.
  private holder() {
    const holder = this.identity.holderAtual();
    if (holder === null) throw new UnauthorizedException();
    return holder;
  }

  @Get('month-summary')
  @ApiOperation({ summary: 'Resumo do mês', description: 'Resumo consolidado dos lançamentos do mês de referência do titular.' })
  @ApiResponse({ status: 200, description: 'Resumo do mês' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  resumoDoMes() {
    return this.consultar.executar(this.holder());
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="lancamentos.csv"')
  @ApiOperation({ summary: 'Exportar lançamentos em CSV', description: 'RF-024: lançamentos do titular em CSV (separador ;) que importa em planilha sem quebra de coluna.' })
  @ApiResponse({ status: 200, description: 'Arquivo CSV' })
  async exportarCSV() {
    return this.exportadorCSV.executar(this.holder());
  }

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos', description: 'Lista os lançamentos do titular autenticado.' })
  @ApiResponse({ status: 200, description: 'Lançamentos do holder' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  async transactions(): Promise<Result<TransactionDTO[]>> {
    const transactions = await this.listar.executar(this.holder());
    return ok(transactions.map(paraTransactionDTO));
  }

  // RF-012: a pessoa corrige a categoria; a partir daqui ela e manual e nenhuma
  // sincronizacao a sobrescreve (RN-011). O titular vem da Identity, nunca da
  // requisicao — id de outra pessoa devolve 404, e nao 403: confirmar que o
  // recurso existe ja seria vazamento (RN-015).
  @Patch(':id/category')
  @ApiOperation({ summary: 'Corrigir categoria', description: 'Define manualmente a categoria de um lançamento do titular.' })
  @ApiResponse({ status: 200, description: 'Categoria corrigida' })
  @ApiResponse({ status: 400, description: 'Categoria fora do catálogo' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado para este titular' })
  async corrigir(@Param('id') id: string, @Body() corpo: unknown): Promise<Result<{ id: string }>> {
    const parse = CorrigirCategoriaDTO.safeParse(corpo);
    if (!parse.success) throw new BadRequestException('categoria ausente ou invalida');

    const resultado = await this.corrigirCategoria.executar({
      holderId: this.holder(),
      transactionId: id,
      category: parse.data.category,
    });

    if (resultado.tipo === 'categoria-invalida') throw new BadRequestException('categoria fora do catalogo');
    if (resultado.tipo === 'nao-encontrado') throw new NotFoundException();

    return ok({ id });
  }
}
