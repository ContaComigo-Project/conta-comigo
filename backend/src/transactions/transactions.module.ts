import { Module } from '@nestjs/common';
import { GetMonthSummaryUseCase } from './application/month-summary';
import { ListarTransactionsUseCase } from './application/list-transactions';
import type { Clock } from './domain/port/driven/clock';
import type { RepositorioDeTransactions } from './domain/port/driven/transaction-repository';
import { TOKENS } from './domain/port/driven/tokens';
import { TransactionsController } from './infrastructure/http/transactions.controller';
import { RepositorioDeTransactionsPrisma } from './infrastructure/persistence/prisma-repository';
import { AccessModule } from '../access/access.module';
import { TokenIdentity } from './infrastructure/http/token-identity';
import { SystemClock } from './infrastructure/clock/system-clock';

// Wiring: o unico lugar que conhece o concreto (ADR-001). Porta -> adaptador
// por token; o caso de uso recebe as portas por fabrica e nunca ve o NestJS.
// Trocar o adaptador em memory pelo Prisma (HT-010) mudou SO esta linha —
// a prova pratica de que o hexagono funciona. O adaptador em memory continua
// existindo para teste (o teste HTTP o injeta pelo mesmo token).
@Module({
  imports: [AccessModule],
  controllers: [TransactionsController],
  providers: [
    { provide: TOKENS.Clock, useClass: SystemClock },
    { provide: TOKENS.Identity, useClass: TokenIdentity },
    { provide: TOKENS.RepositorioDeTransactions, useFactory: () => new RepositorioDeTransactionsPrisma() },
    {
      provide: TOKENS.ListarTransactions,
      inject: [TOKENS.RepositorioDeTransactions],
      useFactory: (repositorio: RepositorioDeTransactions) => new ListarTransactionsUseCase(repositorio),
    },
    {
      provide: TOKENS.GetMonthSummary,
      inject: [TOKENS.RepositorioDeTransactions, TOKENS.Clock],
      useFactory: (repositorio: RepositorioDeTransactions, clock: Clock) =>
        new GetMonthSummaryUseCase(repositorio, clock),
    },
  ],
  exports: [TOKENS.RepositorioDeTransactions],
})
export class TransactionsModule {}
