import { Module } from '@nestjs/common';
import { TOKENS_AGGREGATION } from './domain/port/driven/tokens';
import { FakeAggregator } from './infrastructure/aggregator/fake-aggregator';
import { PluggyAggregator } from './infrastructure/aggregator/pluggy-aggregator';
import { ResilientAggregator } from './infrastructure/aggregator/resilient-aggregator';

// Wiring do contexto `aggregation` (ADR-001): porta -> adaptador por token.
//
// Escolha do adaptador base: o Pluggy so entra quando ha credencial no
// ambiente. Sem ela, o falso assume — o ambiente local sobe e os testes rodam
// sem depender do Sandbox nem de cadastro. O que NUNCA acontece e o Pluggy
// tentar falar sem credencial: ele proprio recusa construir.
//
// Os dois passam pelo mesmo ResilientAggregator, entao a politica de RNF-006
// vale igual nos dois — nao existe caminho sem timeout e sem limite de
// tentativa.
function escolherAgregador() {
  const temCredencial = Boolean(process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET);
  return new ResilientAggregator(temCredencial ? new PluggyAggregator() : new FakeAggregator());
}

@Module({
  providers: [{ provide: TOKENS_AGGREGATION.OpenFinanceAggregator, useFactory: escolherAgregador }],
  exports: [TOKENS_AGGREGATION.OpenFinanceAggregator],
})
export class AggregationModule {}
