import { z } from 'zod';
import { Cents, Reference } from './common';

// Categoria de gasto com o total do periodo. Percentual e derivado: a web o
// calcula sobre os totais recebidos — o transporte nao carrega numero derivado
// que possa divergir do original.
export const SpendingCategoryDTO = z.object({ category: Reference, totalEmCents: Cents }).strict();
export type SpendingCategoryDTO = z.infer<typeof SpendingCategoryDTO>;
