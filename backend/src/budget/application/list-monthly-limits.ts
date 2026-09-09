import { mesValido, type LimiteMensal } from '../domain/model/monthly-limit';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';

// RN-015: a consulta e sempre pelo titular. Nao existe listagem geral.
export type ResultadoDaListagem =
  | { readonly tipo: 'ok'; readonly limites: readonly LimiteMensal[] }
  | { readonly tipo: 'invalido'; readonly motivo: string };

export class ListMonthlyLimits {
  constructor(private readonly repositorio: BudgetRepository) {}

  async executar(entrada: { holderId: string; month: string }): Promise<ResultadoDaListagem> {
    if (!mesValido(entrada.month)) return { tipo: 'invalido', motivo: 'mes de referencia invalido' };

    return { tipo: 'ok', limites: await this.repositorio.listarDoMes(entrada.holderId, entrada.month) };
  }
}
