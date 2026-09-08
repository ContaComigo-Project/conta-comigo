import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { ConsentModule } from './consent/consent.module';
import { TransactionsModule } from './transactions/transactions.module';

// One module per context (ADR-001). New contexts enter here.
@Module({ imports: [AccessModule, AggregationModule, TransactionsModule, ConsentModule] })
export class AppModule {}
