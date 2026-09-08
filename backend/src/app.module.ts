import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { TransactionsModule } from './transactions/transactions.module';

// Um modulo por contexto (ADR-001). Novos contextos entram aqui.
@Module({ imports: [AccessModule, AggregationModule, TransactionsModule] })
export class AppModule {}
