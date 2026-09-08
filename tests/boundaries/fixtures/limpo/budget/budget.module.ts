// O modulo e o unico ponto que conhece o concreto (ADR-001): pode importar tudo.
import { Module } from '@nestjs/common';
import { calcularBand } from './application/calculate-band';
import { RepositorioPrisma } from './infrastructure/persistence/prisma-repository';

@Module({})
export class OrcamentoModule {
  static montar() {
    return (category: string) => calcularBand(new RepositorioPrisma(), category);
  }
}
