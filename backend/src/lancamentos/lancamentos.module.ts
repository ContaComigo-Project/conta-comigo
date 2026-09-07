import { Module } from '@nestjs/common';
import { ConsultarResumoDoMesUseCase } from './application/consultar-resumo-do-mes';
import type { Relogio } from './domain/port/saida/relogio';
import type { RepositorioDeLancamentos } from './domain/port/saida/repositorio-de-lancamentos';
import { TOKENS } from './domain/port/saida/tokens';
import { LancamentosController } from './infrastructure/http/lancamentos.controller';
import { RepositorioDeLancamentosEmMemoria } from './infrastructure/persistence/repositorio-em-memoria';
import { RelogioDoSistema } from './infrastructure/relogio/relogio-do-sistema';

// Wiring: o unico lugar que conhece o concreto (ADR-001). Porta -> adaptador
// por token; o caso de uso recebe as portas por fabrica e nunca ve o NestJS.
@Module({
  controllers: [LancamentosController],
  providers: [
    { provide: TOKENS.Relogio, useClass: RelogioDoSistema },
    { provide: TOKENS.RepositorioDeLancamentos, useFactory: () => new RepositorioDeLancamentosEmMemoria() },
    {
      provide: TOKENS.ConsultarResumoDoMes,
      inject: [TOKENS.RepositorioDeLancamentos, TOKENS.Relogio],
      useFactory: (repositorio: RepositorioDeLancamentos, relogio: Relogio) =>
        new ConsultarResumoDoMesUseCase(repositorio, relogio),
    },
  ],
})
export class LancamentosModule {}
