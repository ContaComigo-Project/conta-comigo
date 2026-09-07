import { Module } from '@nestjs/common';
import { AcessoModule } from './acesso/acesso.module';
import { LancamentosModule } from './lancamentos/lancamentos.module';

// Um modulo por contexto (ADR-001). Novos contextos entram aqui.
@Module({ imports: [AcessoModule, LancamentosModule] })
export class AppModule {}
