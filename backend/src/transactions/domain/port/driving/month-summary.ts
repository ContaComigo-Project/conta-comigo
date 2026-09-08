import type { ReferenceMonth } from '../../reference-month';
import type { HolderId } from '../../model/holder';

export interface ResumoDoMes {
  readonly mes: ReferenceMonth;
  readonly quantidade: number;
  readonly totalEmCentavos: number;
}

// Porta de input (driving): o que o mundo externo pode pedir ao dominio.
export interface GetMonthSummary {
  executar(holderId: HolderId): Promise<ResumoDoMes>;
}
