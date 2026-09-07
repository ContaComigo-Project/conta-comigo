import type { Lancamento } from '../domain/model/lancamento';
import type { ListarLancamentos } from '../domain/port/entrada/listar-lancamentos';
import type { RepositorioDeLancamentos } from '../domain/port/saida/repositorio-de-lancamentos';

// Caso de uso minimo: devolve o que o repositorio conhece. Filtro por mes e
// ordenacao viram regra quando RF-009 (HN-003) chegar.
export class ListarLancamentosUseCase implements ListarLancamentos {
  constructor(private readonly repositorio: RepositorioDeLancamentos) {}

  async executar(): Promise<readonly Lancamento[]> {
    return this.repositorio.listarTodos();
  }
}
