// O modulo e o unico ponto que conhece o concreto (ADR-001): pode importar tudo.
import { Module } from '@nestjs/common';
import { calcularFaixa } from './application/calcular-faixa';
import { RepositorioPrisma } from './infrastructure/persistence/repositorio-prisma';

@Module({})
export class OrcamentoModule {
  static montar() {
    return (categoria: string) => calcularFaixa(new RepositorioPrisma(), categoria);
  }
}
