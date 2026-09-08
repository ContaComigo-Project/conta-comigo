import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { TransactionsModule } from '../../transactions.module';
import { TOKENS } from '../../domain/port/driven/tokens';
import { FixedClock } from '../clock/fixed-clock';
import { RepositorioDeTransactionsEmMemoria } from '../persistence/in-memory-repository';
import { holderId } from '../../domain/model/holder';

import { JwtIssuer } from '../../../access/infrastructure/crypto/jwt-issuer';

const TITULAR = holderId('holder-a');
const autorizado = () => ({ authorization: `Bearer ${new JwtIssuer().emitir(TITULAR).valor}` });
import { z } from 'zod';
import { TransactionDTO, resultadoDe } from '@contacomigo/contract';

// Cenario funcional na fronteira HTTP: controller -> caso de uso -> adaptador
// falso. Sobe o Nest de verdade em porta efemera; nao sobe banco nem navegador.
describe('GET /transactions/month-summary', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [TransactionsModule] })
      // O modulo liga porta -> adaptador por token; o teste troca o adaptador
      // pelo mesmo token, sem conhecer classe concreta de producao.
      .overrideProvider(TOKENS.Clock)
      .useValue(new FixedClock(new Date('2026-02-01T02:59:00Z')))
      .overrideProvider(TOKENS.RepositorioDeTransactions)
      .useValue(
        new RepositorioDeTransactionsEmMemoria([
          { id: '1', holderId: TITULAR, description: 'mercado', amountInCents: 120_00, dueDate: new Date('2026-01-10T12:00:00Z') , externalId: null },
          { id: '2', holderId: TITULAR, description: 'farmacia', amountInCents: 30_00, dueDate: new Date('2026-02-05T12:00:00Z') , externalId: null },
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

  it('GET /transactions responde no CONTRATO: Result<TransactionDTO[]> valido pelo esquema (HT-017)', async () => {
    const response = await fetch(baseUrl + '/transactions', { headers: autorizado() });
    expect(response.status).toBe(200);
    const body = await response.json();
    const parse = resultadoDe(z.array(TransactionDTO)).safeParse(body);
    expect(parse.success, JSON.stringify(parse.success ? null : parse.error.issues)).toBe(true);
    if (!parse.success || parse.data.estado !== 'ok') throw new Error('esperava estado ok');
    expect(parse.data.dados).toHaveLength(2);
    expect(parse.data.dados[0]).toEqual({
      id: '1',
      description: 'mercado',
      category: null,
      instituicao: { id: 'desconhecida', name: 'Desconhecida' },
      amountInCents: 120_00,
      tipo: 'credito',
      dueDate: '2026-01-10T12:00:00.000Z',
    });
  });

  it('responde 200 com o resumo do mes de referencia do clock', async () => {
    const response = await fetch(baseUrl + '/transactions/month-summary', { headers: autorizado() });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      mes: { ano: 2026, mes: 1 },
      quantidade: 1,
      totalEmCentavos: 120_00,
    });
  });
});
