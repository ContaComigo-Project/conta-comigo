import { z } from 'zod';
import { Centavos, InstanteISO, MesDeReferencia, Referencia } from './comum';

// Lancamento como TRANSPORTE. Nada de apresentacao aqui: formato de moeda,
// icone e cor sao da web (mapeadores). Valor em centavos (RN-006); data ISO.
export const TipoDeLancamento = z.enum(['debito', 'credito']);
export type TipoDeLancamento = z.infer<typeof TipoDeLancamento>;

export const LancamentoDTO = z
  .object({
    id: z.string().min(1),
    /** Descricao legivel. O original tecnico fica em `descricaoOriginal` (RN-010). */
    descricao: z.string().min(1),
    descricaoOriginal: z.string().optional(),
    estabelecimento: z.string().optional(),
    categoria: Referencia.nullable(),
    instituicao: Referencia,
    valorEmCentavos: Centavos,
    tipo: TipoDeLancamento,
    dataDeCompetencia: InstanteISO,
  })
  .strict();
export type LancamentoDTO = z.infer<typeof LancamentoDTO>;

export const ResumoDoMesDTO = z
  .object({ mes: MesDeReferencia, quantidade: z.number().int().min(0), totalEmCentavos: Centavos })
  .strict();
export type ResumoDoMesDTO = z.infer<typeof ResumoDoMesDTO>;
