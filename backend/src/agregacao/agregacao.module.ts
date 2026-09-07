import { Module } from '@nestjs/common';
import { TOKENS_AGREGACAO } from './domain/port/saida/tokens';
import { AgregadorFalso } from './infrastructure/agregador/agregador-falso';
import { AgregadorPluggy } from './infrastructure/agregador/agregador-pluggy';
import { AgregadorResiliente } from './infrastructure/agregador/agregador-resiliente';

// Wiring do contexto `agregacao` (ADR-001): porta -> adaptador por token.
//
// Escolha do adaptador base: o Pluggy so entra quando ha credencial no
// ambiente. Sem ela, o falso assume — o ambiente local sobe e os testes rodam
// sem depender do Sandbox nem de cadastro. O que NUNCA acontece e o Pluggy
// tentar falar sem credencial: ele proprio recusa construir.
//
// Os dois passam pelo mesmo AgregadorResiliente, entao a politica de RNF-006
// vale igual nos dois — nao existe caminho sem timeout e sem limite de
// tentativa.
function escolherAgregador() {
  const temCredencial = Boolean(process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET);
  return new AgregadorResiliente(temCredencial ? new AgregadorPluggy() : new AgregadorFalso());
}

@Module({
  providers: [{ provide: TOKENS_AGREGACAO.AgregadorOpenFinance, useFactory: escolherAgregador }],
  exports: [TOKENS_AGREGACAO.AgregadorOpenFinance],
})
export class AgregacaoModule {}
