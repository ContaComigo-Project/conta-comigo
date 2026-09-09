import { z } from 'zod';
import { Cents, ISOInstant, ReferenceMonth, Reference } from './common';

// Transaction como TRANSPORTE. Nada de apresentacao aqui: formato de moeda,
// icone e cor sao da web (mapeadores). Valor em centavos (RN-006); data ISO.
export const TipoDeTransaction = z.enum(['debito', 'credito']);
export type TipoDeTransaction = z.infer<typeof TipoDeTransaction>;

export const TransactionDTO = z
  .object({
    id: z.string().min(1),
    /** Descricao legivel. O original tecnico fica em `descriptionOriginal` (RN-010). */
    description: z.string().min(1),
    descriptionOriginal: z.string().optional(),
    estabelecimento: z.string().optional(),
    category: Reference.nullable(),
    instituicao: Reference,
    amountInCents: Cents,
    tipo: TipoDeTransaction,
    dueDate: ISOInstant,
  })
  .strict();
export type TransactionDTO = z.infer<typeof TransactionDTO>;

// Corpo da correcao manual de categoria (HN-005, RF-012). O identificador da
// categoria e o mesmo do catalogo do dominio; a web ja mapeia icone e cor por
// ele.
export const CorrigirCategoriaDTO = z.object({ category: z.string().min(1) }).strict();
export type CorrigirCategoriaDTO = z.infer<typeof CorrigirCategoriaDTO>;

export const ResumoDoMesDTO = z
  .object({ month: ReferenceMonth, quantidade: z.number().int().min(0), totalEmCents: Cents })
  .strict();
export type ResumoDoMesDTO = z.infer<typeof ResumoDoMesDTO>;
