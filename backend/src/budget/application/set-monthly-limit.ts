import { categoriaValida } from '../../transactions/domain/model/category';
import { mesValido, validarLimite } from '../domain/model/monthly-limit';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';

// RF-013: definir e editar o limite. Definir de novo SUBSTITUI — o repositorio
// grava por chave (titular, mes, categoria), entao nao ha como duplicar.
//
// O catalogo de categorias vem de `transactions` (HN-005). Duplicar a lista aqui
// criaria duas fontes para divergir na primeira categoria nova.

export interface DefinicaoDeLimite {
  readonly holderId: string;
  readonly month: string;
  readonly category: string;
  readonly limitInCents: number;
}

export type ResultadoDaDefinicao =
  | { readonly tipo: 'definido' }
  | { readonly tipo: 'invalido'; readonly motivo: string };

export class SetMonthlyLimit {
  constructor(private readonly repositorio: BudgetRepository) {}

  async executar(definicao: DefinicaoDeLimite): Promise<ResultadoDaDefinicao> {
    if (!mesValido(definicao.month)) return { tipo: 'invalido', motivo: 'mes de referencia invalido' };
    if (!categoriaValida(definicao.category)) return { tipo: 'invalido', motivo: 'categoria fora do catalogo' };

    const validacao = validarLimite(definicao.limitInCents);
    if (!validacao.valido) return { tipo: 'invalido', motivo: validacao.motivo };

    await this.repositorio.definir({
      holderId: definicao.holderId,
      month: definicao.month,
      category: definicao.category,
      limitInCents: definicao.limitInCents,
    });

    return { tipo: 'definido' };
  }
}
