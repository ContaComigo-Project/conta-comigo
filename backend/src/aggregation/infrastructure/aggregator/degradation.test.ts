import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { TransactionsModule } from '../../../transactions/transactions.module';
import { AggregationModule } from '../../aggregation.module';
import { TOKENS } from '../../../transactions/domain/port/driven/tokens';
import { TOKENS_AGGREGATION } from '../../domain/port/driven/tokens';
import { FixedClock } from '../../../transactions/infrastructure/clock/fixed-clock';
import { RepositorioDeTransactionsEmMemoria } from '../../../transactions/infrastructure/persistence/in-memory-repository';
import { holderId } from '../../../transactions/domain/model/holder';
import { JwtIssuer } from '../../../access/infrastructure/crypto/jwt-issuer';
import { falha } from '../../domain/model/aggregation-result';
import type { OpenFinanceAggregator } from '../../domain/port/driven/open-finance-aggregator';

// RNF-005 — falha de integração externa degrada, não derruba.
//
// O painel numérico vive do que já está no banco. Se a indisponibilidade do
// aggregator o esvaziasse, a pessoa perderia access ao próprio histórico por
// causa de um provedor de terceiro — exatamente o que o requisito proíbe.
const TITULAR = holderId('holder-a');

/** Agregador completamente fora: toda chamada falha. */
const aggregatorFora: OpenFinanceAggregator = {
  async listarAccounts() {
    return falha('indisponivel', 'provedor fora do ar');
  },
  async listarTransactions() {
    return falha('indisponivel', 'provedor fora do ar');
  },
};

describe('RNF-005 — o painel sobrevive ao provedor fora', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [TransactionsModule, AggregationModule] })
      .overrideProvider(TOKENS_AGGREGATION.OpenFinanceAggregator)
      .useValue(aggregatorFora)
      .overrideProvider(TOKENS.Clock)
      .useValue(new FixedClock(new Date('2026-01-15T12:00:00Z')))
      .overrideProvider(TOKENS.RepositorioDeTransactions)
      .useValue(
        new RepositorioDeTransactionsEmMemoria([
          { id: 'ja-no-banco-1', holderId: TITULAR, description: 'mercado', amountInCents: 12_000, dueDate: new Date('2026-01-10T12:00:00Z') },
          { id: 'ja-no-banco-2', holderId: TITULAR, description: 'farmacia', amountInCents: 3_000, dueDate: new Date('2026-01-12T12:00:00Z') },
        ]),
      )
      .compile();

    app = modulo.createNestApplication({ logger: false });
    await app.listen(0);
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const autorizado = () => ({ authorization: `Bearer ${new JwtIssuer().emitir(TITULAR).valor}` });

  it('a consulta de lançamentos responde normalmente', async () => {
    const response = await fetch(url + '/transactions', { headers: autorizado() });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.estado).toBe('ok');
    expect(body.dados.map((l: { id: string }) => l.id).sort()).toEqual(['ja-no-banco-1', 'ja-no-banco-2']);
  });

  it('o resumo do mês continua somando o que já está no banco', async () => {
    const response = await fetch(url + '/transactions/month-summary', { headers: autorizado() });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ mes: { ano: 2026, mes: 1 }, quantidade: 2, totalEmCentavos: 15_000 });
  });

  it('o aggregator realmente está fora — o teste não passa por acidente', async () => {
    const resultado = await aggregatorFora.listarAccounts('qualquer');
    expect(resultado.tipo).toBe('falha');
  });
});
