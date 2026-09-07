import type { Lancamento } from '../domain/model/lancamento';
import type { TitularId } from '../domain/model/titular';
import type { ListarLancamentos } from '../domain/port/entrada/listar-lancamentos';
import type { RepositorioDeLancamentos } from '../domain/port/saida/repositorio-de-lancamentos';

// Recebe o titular JA RESOLVIDO (a borda o obtem da Identidade): o caso de uso
// nao conhece cabecalho nem token (ADR-001, regra adicional 4).
export class ListarLancamentosUseCase implements ListarLancamentos {
  constructor(private readonly repositorio: RepositorioDeLancamentos) {}

  async executar(titularId: TitularId): Promise<readonly Lancamento[]> {
    return this.repositorio.listarDoTitular(titularId);
  }
}
