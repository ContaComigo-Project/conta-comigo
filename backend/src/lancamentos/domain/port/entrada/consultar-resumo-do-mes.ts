import type { MesDeReferencia } from '../../mes-de-referencia';
import type { TitularId } from '../../model/titular';

export interface ResumoDoMes {
  readonly mes: MesDeReferencia;
  readonly quantidade: number;
  readonly totalEmCentavos: number;
}

// Porta de entrada (driving): o que o mundo externo pode pedir ao dominio.
export interface ConsultarResumoDoMes {
  executar(titularId: TitularId): Promise<ResumoDoMes>;
}
