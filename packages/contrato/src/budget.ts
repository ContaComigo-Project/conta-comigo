import { z } from 'zod';
import { Cents, ReferenceMonth, Reference } from './common';

// A faixa vem CALCULADA do dominio (RN-001, RN-002). A tela nunca recalcula:
// se recalculasse, 70,04% poderia virar verde em um lugar e amarela em outro.
export const Faixa = z.enum(['verde', 'amarela', 'vermelha', 'sem-limite']);
export type Faixa = z.infer<typeof Faixa>;

export const BudgetCategoryDTO = z
  .object({
    category: Reference,
    month: ReferenceMonth,
    /** `null` = sem limite definido (RN-002): faixa e "sem-limite", nunca verde. */
    limiteEmCents: Cents.nullable(),
    gastoEmCents: Cents,
    faixa: Faixa,
  })
  .strict();
export type BudgetCategoryDTO = z.infer<typeof BudgetCategoryDTO>;
