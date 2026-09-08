import type { ReferenceMonth } from '../../reference-month';
import type { HolderId } from '../../model/holder';

export interface ResumoConsolidado {
  readonly mes: ReferenceMonth;
  /** RN-009: sum of active accounts (checking/savings); a negative balance reduces it. */
  readonly saldoTotalEmCentavos: number;
  /** RN-009: credit card bill (negative), never summed into the balance. */
  readonly faturaDoCartaoEmCentavos: number;
  /** RN-007: debits of the month; a reversal (credit) never inflates this. */
  readonly gastosDoMesEmCentavos: number;
  readonly receitasDoMesEmCentavos: number;
  readonly quantidadeDeLancamentos: number;
}

export interface GetConsolidatedSummary {
  executar(holderId: HolderId): Promise<ResumoConsolidado>;
}