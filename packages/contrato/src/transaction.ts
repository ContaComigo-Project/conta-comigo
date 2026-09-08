import { z } from 'zod';
import { Centavos, InstanteISO, ReferenceMonth, Referencia } from './comum';

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
    categoria: Referencia.nullable(),
    instituicao: Referencia,
    amountInCents: Centavos,
    tipo: TipoDeTransaction,
    dueDate: InstanteISO,
  })
  .strict();
export type TransactionDTO = z.infer<typeof TransactionDTO>;

export const ResumoDoMesDTO = z
  .object({ mes: ReferenceMonth, quantidade: z.number().int().min(0), totalEmCentavos: Centavos })
  .strict();
export type ResumoDoMesDTO = z.infer<typeof ResumoDoMesDTO>;
