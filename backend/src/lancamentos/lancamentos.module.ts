import { Module } from '@nestjs/common';
import { ConsultarResumoDoMesUseCase } from './application/consultar-resumo-do-mes';
import type { Relogio } from './domain/port/saida/relogio';
import type { RepositorioDeLancamentos } from './domain/port/saida/repositorio-de-lancamentos';
import { TOKENS } from './domain/port/saida/tokens';
import { LancamentosController } from './infrastructure/http/lancamentos.controller';
import { RepositorioDeLancamentosPrisma } from './infrastructure/persistence/repositorio-prisma';
import { RelogioDoSistema } from './infrastructure/relogio/relogio-do-sistema';

// Wiring: o unico lugar que conhece o concreto (ADR-001). Porta -> adaptador
// por token; o caso de uso recebe as portas por fabrica e nunca ve o NestJS.
// Trocar o adaptador em memoria pelo Prisma (HT-010) mudou SO esta linha —
// a prova pratica de que o hexagono funciona. O adaptador em memoria continua
// existindo para teste (o teste HTTP o injeta pelo mesmo token).
@Module({
  controllers: [LancamentosController],
  providers: [
    { provide: TOKENS.Relogio, useClass: RelogioDoSistema },
    { provide: TOKENS.RepositorioDeLancamentos, useFactory: () => new RepositorioDeLancamentosPrisma() },
    {
      provide: TOKENS.ConsultarResumoDoMes,
      inject: [TOKENS.RepositorioDeLancamentos, TOKENS.Relogio],
      useFactory: (repositorio: RepositorioDeLancamentos, relogio: Relogio) =>
        new ConsultarResumoDoMesUseCase(repositorio, relogio),
    },
  ],
})
export class LancamentosModule {}
