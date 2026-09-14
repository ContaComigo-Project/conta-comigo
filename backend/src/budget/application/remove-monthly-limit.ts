import { categoriaValida } from '../../transactions/domain/model/category';
import { mesValido } from '../domain/model/monthly-limit';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';

// RN-002: remover o limite volta ao estado "sem limite", que NAO e o mesmo que
// gravar zero — zero e uma intencao ("quero gastar zero") e, por RN-001,
// deixaria a categoria vermelha no primeiro centavo.
export type ResultadoDaRemocao =
  | { readonly tipo: 'removido' }
  | { readonly tipo: 'nao-encontrado' }
  | { readonly tipo: 'invalido'; readonly motivo: string };

export class RemoveMonthlyLimit {
  constructor(private readonly repositorio: BudgetRepository) {}

  async executar(entrada: { holderId: string; month: string; category: string }): Promise<ResultadoDaRemocao> {
    if (!mesValido(entrada.month)) return { tipo: 'invalido', motivo: 'mes de referencia invalido' };
    if (!categoriaValida(entrada.category)) return { tipo: 'invalido', motivo: 'categoria fora do catalogo' };

    const removido = await this.repositorio.remover(entrada.holderId, entrada.month, entrada.category);
    return removido ? { tipo: 'removido' } : { tipo: 'nao-encontrado' };
  }
}
