import { z } from 'zod';
import { Centavos, MesDeReferencia, Referencia } from './comum';

// A faixa vem CALCULADA do dominio (RN-001, RN-002). A tela nunca recalcula:
// se recalculasse, 70,04% poderia virar verde em um lugar e amarela em outro.
export const Faixa = z.enum(['verde', 'amarela', 'vermelha', 'sem-limite']);
export type Faixa = z.infer<typeof Faixa>;

export const CategoriaDeOrcamentoDTO = z
  .object({
    categoria: Referencia,
    mes: MesDeReferencia,
    /** `null` = sem limite definido (RN-002): faixa e "sem-limite", nunca verde. */
    limiteEmCentavos: Centavos.nullable(),
    gastoEmCentavos: Centavos,
    faixa: Faixa,
  })
  .strict();
export type CategoriaDeOrcamentoDTO = z.infer<typeof CategoriaDeOrcamentoDTO>;
