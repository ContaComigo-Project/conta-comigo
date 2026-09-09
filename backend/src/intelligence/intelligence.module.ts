import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { AccessModule } from '../access/access.module';
import { RepositorioDeTransactions } from '../transactions/domain/port/driven/transaction-repository';
import { Clock } from '../transactions/domain/port/driven/clock';
import { TokenIdentity } from '../transactions/infrastructure/http/token-identity';
import { PerguntarNoChatUseCase } from './application/chat';
import { ChatController } from './infrastructure/http/chat.controller';
import { TOKEN_IDENTITY_INTELLIGENCE } from './infrastructure/http/chat-guard';
import { tetoConfigurado } from './domain/model/daily-quota';
import { TOKENS } from '../transactions/domain/port/driven/tokens';
import { TOKENS_INTELLIGENCE } from './domain/port/driven/tokens';
import { CachedAdvisor } from './infrastructure/ai/cached-advisor';
import { CappedAdvisor } from './infrastructure/ai/capped-advisor';
import { FakeAdvisor } from './infrastructure/ai/fake-advisor';
import { GeminiAdvisor } from './infrastructure/ai/gemini-advisor';
import { GuardedAdvisor } from './infrastructure/ai/guarded-advisor';
import { GuardLogEstruturado } from './infrastructure/ai/guard-log-estruturado';
import type { AiAdvisor } from './domain/port/driven/ai-advisor';
import { ResilientAdvisor } from './infrastructure/ai/resilient-advisor';
import { JsonLogSink } from '../observability/infrastructure/logging/json-log-sink';
import { AdviceCachePrisma } from './infrastructure/persistence/advice-cache-prisma';
import { SystemClock } from './infrastructure/persistence/system-clock';
import { UsageCounterPrisma } from './infrastructure/persistence/usage-counter-prisma';

// Wiring do contexto `intelligence` (ADR-001): porta -> adaptador por token.
//
// Escolha do adaptador base, igual à de `HT-011`: o Gemini só entra quando há
// chave no ambiente. Sem ela o falso assume, e o ambiente local sobe sem
// cadastro em provedor. O Gemini nunca tenta falar sem chave — ele mesmo recusa
// construir.
//
// A ordem da pilha é regra, não estética:
//
//   Capped -> Cached -> Guarded -> Resilient -> (Gemini | Falso)
//
// O teto vem primeiro para que quem está acima da cota não consuma nem cache
// nem rede. O cache vem antes da resiliência para que um acerto de cache não
// pague espera nenhuma. A guarda de saída (HT-014) fica ABAIXO do cache: assim
// resposta reprovada nunca é guardada, e o que está guardado já passou pelos
// três exames. E todas valem para os dois adaptadores: não existe caminho sem
// teto, sem cache, sem guarda e sem limite de espera.
function montarAdvisor() {
  const chave = process.env.GEMINI_API_KEY;
  const base = chave ? new GeminiAdvisor({ apiKey: chave }) : new FakeAdvisor();

  const guardado = new GuardedAdvisor(new ResilientAdvisor(base), new GuardLogEstruturado(new JsonLogSink()));

  return new CappedAdvisor(
    new CachedAdvisor(guardado, new AdviceCachePrisma()),
    new UsageCounterPrisma(),
    new SystemClock(),
    tetoConfigurado(process.env.AI_DAILY_LIMIT),
  );
}

@Module({
  imports: [TransactionsModule, AccessModule],
  controllers: [ChatController],
  providers: [
    { provide: TOKENS_INTELLIGENCE.AiAdvisor, useFactory: montarAdvisor },
    { provide: TOKENS_INTELLIGENCE.Clock, useClass: SystemClock },
    { provide: TOKEN_IDENTITY_INTELLIGENCE, useClass: TokenIdentity },
    {
      provide: TOKENS_INTELLIGENCE.PerguntarNoChat,
      inject: [TOKENS.RepositorioDeTransactions, TOKENS_INTELLIGENCE.Clock, TOKENS_INTELLIGENCE.AiAdvisor],
      useFactory: (transactions: RepositorioDeTransactions, clock: Clock, advisor: AiAdvisor) =>
        new PerguntarNoChatUseCase(transactions, clock, advisor),
    },
  ],
  exports: [TOKENS_INTELLIGENCE.AiAdvisor, TOKENS_INTELLIGENCE.Clock],
})
export class IntelligenceModule {}
