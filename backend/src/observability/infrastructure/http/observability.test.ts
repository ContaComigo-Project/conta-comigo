import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Controller, Get, type INestApplication, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ObservabilityModule } from '../../observability.module';
import { TOKENS_OBSERVABILITY } from '../../domain/port/driven/tokens';
import { MemoryLogSink } from '../logging/memory-log-sink';
import { CorrelationMiddleware } from './correlation.middleware';
import { RequestLogInterceptor } from './request-log.interceptor';
import { TraceableErrorFilter } from './traceable-error.filter';

@Controller('exemplo')
class ExemploController {
  @Get('ok')
  ok() {
    return { estado: 'ok' };
  }

  @Get('falha')
  falha() {
    // Erro realista: a mensagem carrega dado pessoal, como um erro de banco.
    throw new Error('conexao recusada para email=pessoa@exemplo.com');
  }
}

@Module({ imports: [ObservabilityModule], controllers: [ExemploController] })
class ModuloDeExemplo implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*splat');
  }
}

// Cenario funcional na fronteira HTTP: uma requisicao inteira, com o Nest de
// verdade em porta efemera. O sink em memoria substitui o stdout — o que
// importa e a linha produzida, nao onde ela e escrita.
describe('HT-012 — log estruturado e erro rastreavel', () => {
  let app: INestApplication;
  let baseUrl: string;
  const sink = new MemoryLogSink();

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [ModuloDeExemplo] })
      .overrideProvider(TOKENS_OBSERVABILITY.LogSink)
      .useValue(sink)
      .compile();

    app = modulo.createNestApplication({ logger: false });
    app.useGlobalInterceptors(app.get(RequestLogInterceptor));
    app.useGlobalFilters(app.get(TraceableErrorFilter));
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('RNF-008 — a resposta devolve x-request-id e a requisicao vira uma linha JSON', async () => {
    sink.limpar();
    const response = await fetch(baseUrl + '/exemplo/ok');

    expect(response.status).toBe(200);
    const correlacao = response.headers.get('x-request-id');
    expect(correlacao).toBeTruthy();

    expect(sink.entradas).toHaveLength(1);
    const linha = sink.entradas[0];
    expect(linha).toMatchObject({
      level: 'info',
      requestId: correlacao,
      method: 'GET',
      route: '/exemplo/ok',
      status: 200,
    });
    expect(typeof linha.durationMs).toBe('number');
    expect(typeof linha.timestamp).toBe('string');
  });

  it('RNF-008 — o x-request-id recebido e preservado, para correlacionar entre servicos', async () => {
    sink.limpar();
    const response = await fetch(baseUrl + '/exemplo/ok', { headers: { 'x-request-id': 'correlacao-de-fora' } });

    expect(response.headers.get('x-request-id')).toBe('correlacao-de-fora');
    expect(sink.entradas[0].requestId).toBe('correlacao-de-fora');
  });

  it('RNF-008 — a falha e rastreavel: mesmo requestId na resposta e no log, com a operacao', async () => {
    sink.limpar();
    const response = await fetch(baseUrl + '/exemplo/falha');

    expect(response.status).toBe(500);
    const correlacao = response.headers.get('x-request-id');
    const corpo = (await response.json()) as { estado: string; requestId: string };
    expect(corpo.estado).toBe('erro');
    expect(corpo.requestId).toBe(correlacao);

    const erro = sink.entradas.find((entrada) => entrada.level === 'error');
    expect(erro, JSON.stringify(sink.entradas)).toBeDefined();
    expect(erro).toMatchObject({ requestId: correlacao, operation: 'GET /exemplo/falha', status: 500 });
  });

  it('RNF-015 — nenhum dado pessoal chega ao log, nem pela mensagem do erro', async () => {
    sink.limpar();
    await fetch(baseUrl + '/exemplo/falha', {
      headers: { authorization: 'Bearer token-secreto', 'x-request-id': 'req-sensivel' },
    });

    const saida = JSON.stringify(sink.entradas);
    expect(saida).not.toContain('pessoa@exemplo.com');
    expect(saida).not.toContain('token-secreto');
  });
});
