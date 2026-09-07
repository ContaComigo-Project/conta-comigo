import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { LancamentosModule } from '../../lancamentos.module';
import { TOKENS } from '../../domain/port/saida/tokens';
import { RelogioFixo } from '../relogio/relogio-fixo';
import { RepositorioDeLancamentosEmMemoria } from '../persistence/repositorio-em-memoria';

// Cenario funcional na fronteira HTTP: controller -> caso de uso -> adaptador
// falso. Sobe o Nest de verdade em porta efemera; nao sobe banco nem navegador.
describe('GET /lancamentos/resumo-do-mes', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [LancamentosModule] })
      // O modulo liga porta -> adaptador por token; o teste troca o adaptador
      // pelo mesmo token, sem conhecer classe concreta de producao.
      .overrideProvider(TOKENS.Relogio)
      .useValue(new RelogioFixo(new Date('2026-02-01T02:59:00Z')))
      .overrideProvider(TOKENS.RepositorioDeLancamentos)
      .useValue(
        new RepositorioDeLancamentosEmMemoria([
          { id: '1', descricao: 'mercado', valorEmCentavos: 120_00, dataDeCompetencia: new Date('2026-01-10T12:00:00Z') },
          { id: '2', descricao: 'farmacia', valorEmCentavos: 30_00, dataDeCompetencia: new Date('2026-02-05T12:00:00Z') },
        ]),
      )
      .compile();

    app = modulo.createNestApplication({ logger: false });
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 200 com o resumo do mes de referencia do relogio', async () => {
    const resposta = await fetch(baseUrl + '/lancamentos/resumo-do-mes');
    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({
      mes: { ano: 2026, mes: 1 },
      quantidade: 1,
      totalEmCentavos: 120_00,
    });
  });
});
