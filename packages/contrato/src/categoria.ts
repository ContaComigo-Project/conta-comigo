import { z } from 'zod';
import { Centavos, Referencia } from './comum';

// Categoria de gasto com o total do periodo. Percentual e derivado: a web o
// calcula sobre os totais recebidos — o transporte nao carrega numero derivado
// que possa divergir do original.
export const CategoriaDeGastoDTO = z.object({ categoria: Referencia, totalEmCentavos: Centavos }).strict();
export type CategoriaDeGastoDTO = z.infer<typeof CategoriaDeGastoDTO>;
