import type { Lancamento } from '../../domain/model/lancamento';
import type { RepositorioDeLancamentos } from '../../domain/port/saida/repositorio-de-lancamentos';

// Adaptador falso (ADR-001: "todo adaptador externo nasce com uma implementacao
// falsa para teste"). A persistencia real chega em HT-010.
export class RepositorioDeLancamentosEmMemoria implements RepositorioDeLancamentos {
  constructor(private readonly itens: readonly Lancamento[] = []) {}

  async listarTodos(): Promise<readonly Lancamento[]> {
    return this.itens;
  }
}
