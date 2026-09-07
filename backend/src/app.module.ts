import { Module } from '@nestjs/common';
import { LancamentosModule } from './lancamentos/lancamentos.module';

// Um modulo por contexto (ADR-001). Novos contextos entram aqui.
@Module({ imports: [LancamentosModule] })
export class AppModule {}
