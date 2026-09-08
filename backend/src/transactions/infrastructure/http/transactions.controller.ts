import { Controller, Get, Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ok, type TransactionDTO, type Result } from '@contacomigo/contrato';
import type { GetMonthSummary } from '../../domain/port/driving/month-summary';
import type { ListarTransactions } from '../../domain/port/driving/list-transactions';
import type { Identity } from '../../domain/port/driven/identity';
import { GuardaDeHolder } from './holder-guard';
import { TOKENS } from '../../domain/port/driven/tokens';
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
  ) {}

  // A guarda ja recusou a requisicao sem holder; aqui o null so aconteceria
  // se alguem removesse a guarda — e entao falhar alto e o comportamento certo.
  private holder() {
    const holder = this.identity.holderAtual();
    if (holder === null) throw new UnauthorizedException();
    return holder;
  }

  @Get('month-summary')
  @ApiOperation({ summary: 'Resumo do mês', description: 'Resumo consolidado dos lançamentos do mês de referência do holder (RN-003).' })
  @ApiResponse({ status: 200, description: 'Resumo do mês' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  resumoDoMes() {
    return this.consultar.executar(this.holder());
  }

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos', description: 'Lista os lançamentos do holder autenticado (RN-015).' })
  @ApiResponse({ status: 200, description: 'Lançamentos do holder' })
  @ApiResponse({ status: 401, description: 'Sem token Bearer válido' })
  async transactions(): Promise<Result<TransactionDTO[]>> {
    const transactions = await this.listar.executar(this.holder());
    return ok(transactions.map(paraTransactionDTO));
  }
}
