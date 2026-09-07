import type { Lancamento } from '../../domain/model/lancamento';
import type { TitularId } from '../../domain/model/titular';
import type { RepositorioDeLancamentos } from '../../domain/port/saida/repositorio-de-lancamentos';

// Adaptador falso (ADR-001). A persistencia real e o RepositorioDeLancamentosPrisma.
export class RepositorioDeLancamentosEmMemoria implements RepositorioDeLancamentos {
  constructor(private readonly itens: readonly Lancamento[] = []) {}

  async listarDoTitular(titularId: TitularId): Promise<readonly Lancamento[]> {
    return this.itens.filter((l) => l.titularId === titularId);
  }
}
