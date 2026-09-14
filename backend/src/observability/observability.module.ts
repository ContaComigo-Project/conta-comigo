import { Module } from '@nestjs/common';
import { TOKENS_OBSERVABILITY } from './domain/port/driven/tokens';
import { JsonLogSink } from './infrastructure/logging/json-log-sink';
import { SystemClock } from './infrastructure/logging/system-clock';
import { CorrelationMiddleware } from './infrastructure/http/correlation.middleware';
import { RequestLogInterceptor } from './infrastructure/http/request-log.interceptor';
import { TraceableErrorFilter } from './infrastructure/http/traceable-error.filter';

// Wiring (ADR-001): porta -> adaptador por token. O interceptor e o filtro sao
// exportados como provider comum, e nao como APP_INTERCEPTOR/APP_FILTER, para
// que o teste possa trocar o sink pelo mesmo token sem subir o app inteiro.
@Module({
  providers: [
    { provide: TOKENS_OBSERVABILITY.LogSink, useClass: JsonLogSink },
    { provide: TOKENS_OBSERVABILITY.Clock, useClass: SystemClock },
    CorrelationMiddleware,
    RequestLogInterceptor,
    TraceableErrorFilter,
  ],
  exports: [TOKENS_OBSERVABILITY.LogSink, TOKENS_OBSERVABILITY.Clock, CorrelationMiddleware, RequestLogInterceptor, TraceableErrorFilter],
})
export class ObservabilityModule {}
