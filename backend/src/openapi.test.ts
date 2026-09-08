import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { configurarOpenApi } from './openapi';

// Teste de controle de HT-019: a API e descoberta pela propria documentacao.
// Sobe o Nest de verdade em porta efemera com o Swagger configurado e prova
// que a UI responde e que a spec lista os endpoints existentes. Nenhum
// endpoint de negocio e chamado aqui; o AppModule sobe com o agregador falso
// quando nao ha credencial Pluggy no ambiente.
process.env.JWT_SECRET ??= 'segredo-apenas-de-teste-nao-usar-em-lugar-nenhum';

const ENDPOINTS_ESPERADOS = [
  '/acesso/contas',
  '/acesso/sessoes',
  '/acesso/sessoes/renovacao',
  '/lancamentos',
  '/lancamentos/resumo-do-mes',
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
    const resposta = await fetch(url + '/api/docs');
    expect(resposta.status).toBe(200);
  });

  it('GET /api-json responde 200 com spec OpenAPI valida', async () => {
    const resposta = await fetch(url + '/api-json');
    expect(resposta.status).toBe(200);
    const spec = (await resposta.json()) as { openapi?: string; paths?: Record<string, unknown> };
    expect(spec.openapi).toBeDefined();
    expect(spec.paths).toBeDefined();
  });

  it('a spec lista os 6 endpoints existentes', async () => {
    const resposta = await fetch(url + '/api-json');
    const spec = (await resposta.json()) as {
      paths: Record<string, Record<string, unknown>>;
    };

    const caminhos = Object.keys(spec.paths).sort();
    expect(caminhos).toEqual([...ENDPOINTS_ESPERADOS].sort());

    // /acesso/sessoes tem POST e DELETE; o restante, um metodo cada: 6 no total.
    const metodos = Object.values(spec.paths).flatMap((p) => Object.keys(p));
    expect(metodos.sort()).toEqual(['delete', 'get', 'get', 'post', 'post', 'post']);
  });

  it('os endpoints de lancamentos exigem autenticacao Bearer na spec', async () => {
    const resposta = await fetch(url + '/api-json');
    const spec = (await resposta.json()) as {
      paths: Record<string, Record<string, { security?: Array<Record<string, unknown>> }>>;
    };

    for (const caminho of ['/lancamentos', '/lancamentos/resumo-do-mes']) {
      const operacoes = spec.paths[caminho];
      for (const operacao of Object.values(operacoes)) {
        const seguranca = operacao.security ?? [];
        const temBearer = seguranca.some((s) => 'bearer' in s);
        expect(temBearer, `${caminho} sem exigencia de Bearer na spec`).toBe(true);
      }
    }
  });
});