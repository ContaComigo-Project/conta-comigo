import { z } from 'zod';

// Consolidated panel (HN-003): balance, card bill and the month summary.

export const ConsolidatedSummaryDTO = z
  .object({
    mes: z.object({ ano: z.number().int(), mes: z.number().int().min(1).max(12) }).strict(),
    saldoTotalEmCentavos: z.number().int(),
    faturaDoCartaoEmCentavos: z.number().int(),
    gastosDoMesEmCentavos: z.number().int(),
    receitasDoMesEmCentavos: z.number().int(),
    quantidadeDeLancamentos: z.number().int().min(0),
  })
  .strict();
export type ConsolidatedSummaryDTO = z.infer<typeof ConsolidatedSummaryDTO>;