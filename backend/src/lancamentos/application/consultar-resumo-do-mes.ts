import { mesDeReferencia, mesmoMes } from '../domain/mes-de-referencia';
import type { ConsultarResumoDoMes, ResumoDoMes } from '../domain/port/entrada/consultar-resumo-do-mes';
import type { TitularId } from '../domain/model/titular';
import type { Relogio } from '../domain/port/saida/relogio';
import type { RepositorioDeLancamentos } from '../domain/port/saida/repositorio-de-lancamentos';

// Caso de uso. Recebe portas por construtor; nao sabe quem as implementa.
// Sem @Injectable: a ligacao por token acontece no modulo (ADR-001, regra 3).
export class ConsultarResumoDoMesUseCase implements ConsultarResumoDoMes {
  constructor(
    private readonly repositorio: RepositorioDeLancamentos,
    private readonly relogio: Relogio,
  ) {}

  async executar(titularId: TitularId): Promise<ResumoDoMes> {
    const mes = mesDeReferencia(this.relogio.agora());
    const doMes = (await this.repositorio.listarDoTitular(titularId)).filter((l) =>
      mesmoMes(mesDeReferencia(l.dataDeCompetencia), mes),
    );
    return {
      mes,
      quantidade: doMes.length,
      totalEmCentavos: doMes.reduce((soma, l) => soma + l.valorEmCentavos, 0),
    };
  }
}
