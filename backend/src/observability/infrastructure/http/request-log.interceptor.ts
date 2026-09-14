import { CallHandler, ExecutionContext, Inject, Injectable, type NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { RequisicaoHttp, RespostaHttp } from './express-shapes';
import { logEntry } from '../../domain/model/log-entry';
import type { Clock } from '../../domain/port/driven/clock';
import type { LogSink } from '../../domain/port/driven/log-sink';
import { TOKENS_OBSERVABILITY } from '../../domain/port/driven/tokens';
import { correlacaoDe } from './correlation.middleware';

// Uma linha por requisicao (RNF-008). O que entra e o que diagnostica: metodo,
// rota, status e duracao. Corpo, cabecalho e query NAO entram — seriam a via
// mais curta para violar RNF-015.
@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(
    @Inject(TOKENS_OBSERVABILITY.LogSink) private readonly sink: LogSink,
    @Inject(TOKENS_OBSERVABILITY.Clock) private readonly clock: Clock,
  ) {}

  intercept(contexto: ExecutionContext, proximo: CallHandler): Observable<unknown> {
    if (contexto.getType() !== 'http') return proximo.handle();

    const http = contexto.switchToHttp();
    const requisicao = http.getRequest<RequisicaoHttp>();
    const inicio = Date.now();

    const registrar = (status: number) => {
      this.sink.escrever(
        logEntry({
          level: status >= 500 ? 'error' : 'info',
          message: 'requisicao concluida',
          requestId: correlacaoDe(requisicao),
          at: this.clock.agora(),
          data: {
            method: requisicao.method,
            route: requisicao.path,
            status,
            durationMs: Date.now() - inicio,
          },
        }),
      );
    };

    return proximo.handle().pipe(
      tap({
        next: () => registrar(http.getResponse<RespostaHttp>().statusCode),
        // A falha e registrada pelo filtro, que conhece o status real e a causa;
        // registrar aqui tambem duplicaria a linha.
        error: () => undefined,
      }),
    );
  }
}
