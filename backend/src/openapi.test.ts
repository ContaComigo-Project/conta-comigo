import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { configurarOpenApi } from './openapi';

// Teste de controle de HT-019: a API e descoberta pela propria documentacao.
// Sobe o Nest de verdade em porta efemera com o Swagger configurado e prova
// que a UI responde e que a spec lista os endpoints existentes. Nenhum
// endpoint de negocio e chamado aqui; o AppModule sobe com o aggregator falso
// quando nao ha credencial Pluggy no ambiente.
process.env.JWT_SECRET ??= 'segredo-apenas-de-teste-nao-usar-em-lugar-nenhum';

const ENDPOINTS_ESPERADOS = [
  '/access/accounts',
  '/access/accounts/me',
  '/access/sessions',
  '/access/sessions/refresh',
  '/budgets/{month}',
  '/budgets/{month}/{category}',
  '/consents',
  '/consents/account',
  '/consents/{id}',
  '/consents/{id}/sync',
  '/budgets/semaphore',
  '/dashboard/summary',
  '/transactions',
  '/transactions/month-summary',
  '/transactions/{id}/category',
];

describe('HT-019 — a API e descoberta pela propria documentacao', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication({ logger: false });
    configurarOpenApi(app);
    await app.listen(0);
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/docs responde 200 (UI Swagger)', async () => {
    const response = await fetch(url + '/api/docs');
    expect(response.status).toBe(200);
  });

  it('GET /api-json responde 200 com spec OpenAPI valida', async () => {
    const response = await fetch(url + '/api-json');
    expect(response.status).toBe(200);
    const spec = (await response.json()) as { openapi?: string; paths?: Record<string, unknown> };
    expect(spec.openapi).toBeDefined();
    expect(spec.paths).toBeDefined();
  });

  it('a spec lista todos os endpoints existentes', async () => {
    const response = await fetch(url + '/api-json');
    const spec = (await response.json()) as {
      paths: Record<string, Record<string, unknown>>;
    };

    const caminhos = Object.keys(spec.paths).sort();
    expect(caminhos).toEqual([...ENDPOINTS_ESPERADOS].sort());

    // /access/sessions tem POST e DELETE; /consents tem POST e GET;
    // /consents/{id} e /consents/account têm DELETE; /transactions/{id}/category
    // tem PATCH (HN-005); /budgets/{month}/{category} tem PUT e DELETE (HN-006);
    // o restante, um método cada.
    const metodos = Object.values(spec.paths).flatMap((p) => Object.keys(p));
    expect(metodos.sort()).toEqual([
      'delete', 'delete', 'delete', 'delete', 'get', 'get', 'get', 'get', 'get', 'get', 'get',
      'patch', 'post', 'post', 'post', 'post', 'post', 'put',
    ]);
  });

  it('os endpoints de transactions exigem autenticacao Bearer na spec', async () => {
    const response = await fetch(url + '/api-json');
    const spec = (await response.json()) as {
      paths: Record<string, Record<string, { security?: Array<Record<string, unknown>> }>>;
    };

    for (const caminho of ['/transactions', '/transactions/month-summary', '/transactions/{id}/category']) {
      const operacoes = spec.paths[caminho];
      for (const operacao of Object.values(operacoes)) {
        const seguranca = operacao.security ?? [];
        const temBearer = seguranca.some((s) => 'bearer' in s);
        expect(temBearer, `${caminho} sem exigencia de Bearer na spec`).toBe(true);
      }
    }
  });
});