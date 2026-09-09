import { ArgumentsHost, Catch, type ExceptionFilter, HttpException, Inject, Injectable } from '@nestjs/common';
import type { RequisicaoHttp, RespostaHttp } from './express-shapes';
import { logEntry } from '../../domain/model/log-entry';
import type { Clock } from '../../domain/port/driven/clock';
import type { LogSink } from '../../domain/port/driven/log-sink';
import { TOKENS_OBSERVABILITY } from '../../domain/port/driven/tokens';
import { correlacaoDe } from './correlation.middleware';

// RNF-008: a falha precisa ser diagnosticavel sem acesso a maquina. A resposta
// devolve o requestId e o log registra a mesma correlacao com a operacao — os
// dois lados da ponte entre o que a pessoa viu e o que o servidor sabe.
//
// O corpo devolvido ao cliente NAO carrega a mensagem do erro interno: essa
// mensagem costuma citar tabela, coluna e valor (RNF-015). Ela vai so para o
// log, ja redigida.
@Injectable()
@Catch()
export class TraceableErrorFilter implements ExceptionFilter {
  constructor(
    @Inject(TOKENS_OBSERVABILITY.LogSink) private readonly sink: LogSink,
    @Inject(TOKENS_OBSERVABILITY.Clock) private readonly clock: Clock,
  ) {}

  catch(excecao: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const requisicao = http.getRequest<RequisicaoHttp>();
    const resposta = http.getResponse<RespostaHttp>();

    const status = excecao instanceof HttpException ? excecao.getStatus() : 500;
    const correlacao = correlacaoDe(requisicao);
    const operacao = `${requisicao.method} ${requisicao.path}`;

    this.sink.escrever(
      logEntry({
        level: status >= 500 ? 'error' : 'warn',
        message: excecao instanceof Error ? excecao.message : 'falha desconhecida',
        requestId: correlacao,
        at: this.clock.agora(),
        data: {
          operation: operacao,
          status,
          method: requisicao.method,
          route: requisicao.path,
          kind: excecao instanceof Error ? excecao.name : typeof excecao,
        },
      }),
    );

    const corpo =
      excecao instanceof HttpException
        ? { ...(typeof excecao.getResponse() === 'object' ? (excecao.getResponse() as object) : { motivo: excecao.getResponse() }) }
        : { motivo: 'falha interna' };

    resposta.status(status).json({ estado: 'erro', requestId: correlacao, ...corpo });
  }
}
