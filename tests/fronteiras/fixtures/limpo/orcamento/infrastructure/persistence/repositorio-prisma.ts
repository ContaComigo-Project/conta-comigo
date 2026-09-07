// Unico lugar onde @prisma/client pode aparecer (ADR-002, regra 2).
import { PrismaClient } from '@prisma/client';
import type { RepositorioDeOrcamento } from '../../domain/port/saida/repositorio-de-orcamento';

export class RepositorioPrisma implements RepositorioDeOrcamento {
  private readonly cliente = new PrismaClient();
  async percentualGasto(): Promise<number> {
    void this.cliente;
    return 0;
  }
}
