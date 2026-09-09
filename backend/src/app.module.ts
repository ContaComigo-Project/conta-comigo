import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { ConsentModule } from './consent/consent.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { ObservabilityModule } from './observability/observability.module';
import { CorrelationMiddleware } from './observability/infrastructure/http/correlation.middleware';
import { TransactionsModule } from './transactions/transactions.module';

// One module per context (ADR-001). New contexts enter here.
// A correlacao (HT-012) e middleware porque precisa existir ANTES da guarda e
// do controller: um 401 tambem tem de ser rastreavel.
@Module({ imports: [AccessModule, AggregationModule, TransactionsModule, ConsentModule, ObservabilityModule, IntelligenceModule] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*splat');
  }
}
