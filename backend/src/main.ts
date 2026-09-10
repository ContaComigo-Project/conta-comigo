import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configurarOpenApi } from './openapi';
import { logEntry } from './observability/domain/model/log-entry';
import { requestId } from './observability/domain/model/request-id';
import type { Clock } from './observability/domain/port/driven/clock';
import type { LogSink } from './observability/domain/port/driven/log-sink';
import { TOKENS_OBSERVABILITY } from './observability/domain/port/driven/tokens';
import { RequestLogInterceptor } from './observability/infrastructure/http/request-log.interceptor';
import { TraceableErrorFilter } from './observability/infrastructure/http/traceable-error.filter';

const PORTA = Number(process.env.PORT ?? 3000);

async function iniciar() {
  const app = await NestFactory.create(AppModule);
  // A web roda em outra origem (Vite dev em :5173); sem CORS o navegador
  // bloqueia o login e as chamadas do painel (HN-003 integration). Credentials
  // habilitado para o cookie httpOnly do refresh (HT-018).
  app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:4173'], credentials: true });
  app.use(cookieParser());
  configurarOpenApi(app);

  // Observabilidade (HT-012): uma linha por requisicao e erro rastreavel pela
  // mesma correlacao que a resposta devolve.
  app.useGlobalInterceptors(app.get(RequestLogInterceptor));
  app.useGlobalFilters(app.get(TraceableErrorFilter));

  await app.listen(PORTA);

  // O proprio start fala a mesma lingua do resto: JSON estruturado, nao print.
  const sink = app.get<LogSink>(TOKENS_OBSERVABILITY.LogSink);
  const clock = app.get<Clock>(TOKENS_OBSERVABILITY.Clock);
  sink.escrever(
    logEntry({
      level: 'info',
      message: 'api ouvindo',
      requestId: requestId('boot'),
      at: clock.agora(),
      data: { url: `http://localhost:${PORTA}`, docs: `http://localhost:${PORTA}/api/docs` },
    }),
  );
}

iniciar();
