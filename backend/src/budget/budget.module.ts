import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { TOKENS_INTELLIGENCE } from '../intelligence/domain/port/driven/tokens';
import type { AiAdvisor } from '../intelligence/domain/port/driven/ai-advisor';
import { GetDiagnosisUseCase } from './application/get-diagnosis';
import { SimularPlanoDeCompraUseCase } from './application/simulate-purchase';
import { ExportarRelatorioPDF } from './application/export-relatorio-pdf';
import { TransactionsModule } from '../transactions/transactions.module';
import { TOKENS } from '../transactions/domain/port/driven/tokens';
import type { RepositorioDeTransactions } from '../transactions/domain/port/driven/transaction-repository';
import { GetBudgetSemaphoreUseCase } from './application/get-budget-semaphore';
import { GetBudgetHistoryUseCase } from './application/get-budget-history';
import type { Clock } from '../transactions/domain/port/driven/clock';
import { ListMonthlyLimits } from './application/list-monthly-limits';
import { RemoveMonthlyLimit } from './application/remove-monthly-limit';
import { SetMonthlyLimit } from './application/set-monthly-limit';
import type { BudgetRepository } from './domain/port/driven/budget-repository';
import { TOKENS_BUDGET } from './domain/port/driven/tokens';
import { BudgetController } from './infrastructure/http/budget.controller';
import { GuardaDeHolderDoBudget, TOKEN_IDENTITY_BUDGET } from './infrastructure/http/holder-guard';
import { BudgetRepositoryPrisma } from './infrastructure/persistence/budget-repository-prisma';
import { TokenIdentity } from '../transactions/infrastructure/http/token-identity';

// Wiring do contexto `budget` (ADR-001): porta -> adaptador por token.
//
// A identidade reaproveita o TokenIdentity de HN-001 em vez de um adaptador
// novo: o token e o mesmo, e duplicar a leitura dele criaria dois lugares para
// divergir na proxima mudanca de autenticacao.
@Module({
  imports: [AccessModule, TransactionsModule, IntelligenceModule],
  controllers: [BudgetController],
  providers: [
    {
      provide: TOKENS_BUDGET.GetBudgetSemaphore,
      inject: [TOKENS_BUDGET.BudgetRepository, TOKENS.RepositorioDeTransactions],
      useFactory: (repo: BudgetRepository, transactions: RepositorioDeTransactions) =>
        new GetBudgetSemaphoreUseCase(repo, transactions),
    },
    {
      provide: TOKENS_BUDGET.GetBudgetHistory,
      inject: [TOKENS_BUDGET.BudgetRepository, TOKENS.RepositorioDeTransactions, TOKENS.Clock],
      useFactory: (repo: BudgetRepository, transactions: RepositorioDeTransactions, clock: Clock) =>
        new GetBudgetHistoryUseCase(repo, transactions, clock),
    },
    {
      provide: TOKENS_BUDGET.SimularPlanoDeCompra,
      inject: [TOKENS_BUDGET.BudgetRepository, TOKENS.RepositorioDeTransactions, TOKENS.Clock],
      useFactory: (repo: BudgetRepository, transactions: RepositorioDeTransactions, clock: Clock) =>
        new SimularPlanoDeCompraUseCase(repo, transactions, clock),
    },
    {
      provide: TOKENS_BUDGET.ExportarRelatorioPDF,
      inject: [TOKENS_BUDGET.BudgetRepository, TOKENS.RepositorioDeTransactions, TOKENS.Clock],
      useFactory: (repo: BudgetRepository, transactions: RepositorioDeTransactions, clock: Clock) =>
        new ExportarRelatorioPDF(repo, transactions, clock),
    },
    {
      provide: TOKENS_BUDGET.GetDiagnosis,
      inject: [
        TOKENS_BUDGET.BudgetRepository,
        TOKENS.RepositorioDeTransactions,
        TOKENS.Clock,
        TOKENS_INTELLIGENCE.AiAdvisor,
      ],
      useFactory: (
        repo: BudgetRepository,
        transactions: RepositorioDeTransactions,
        clock: Clock,
        advisor: AiAdvisor,
      ) => new GetDiagnosisUseCase(repo, transactions, clock, advisor),
    },

    { provide: TOKEN_IDENTITY_BUDGET, useClass: TokenIdentity },
    GuardaDeHolderDoBudget,
    { provide: TOKENS_BUDGET.BudgetRepository, useFactory: () => new BudgetRepositoryPrisma() },
    {
      provide: TOKENS_BUDGET.SetMonthlyLimit,
      inject: [TOKENS_BUDGET.BudgetRepository],
      useFactory: (repositorio: BudgetRepository) => new SetMonthlyLimit(repositorio),
    },
    {
      provide: TOKENS_BUDGET.RemoveMonthlyLimit,
      inject: [TOKENS_BUDGET.BudgetRepository],
      useFactory: (repositorio: BudgetRepository) => new RemoveMonthlyLimit(repositorio),
    },
    {
      provide: TOKENS_BUDGET.ListMonthlyLimits,
      inject: [TOKENS_BUDGET.BudgetRepository],
      useFactory: (repositorio: BudgetRepository) => new ListMonthlyLimits(repositorio),
    },
  ],
  exports: [TOKENS_BUDGET.BudgetRepository],
})
export class BudgetModule {}
