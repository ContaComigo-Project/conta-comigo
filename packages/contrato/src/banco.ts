import { z } from 'zod';
import { Centavos, InstanteISO } from './comum';

// Instituicao conectada. Saldo em centavos; cor e iniciais sao da web.
export const StatusDeConexao = z.enum(['ativo', 'sincronizando', 'error']);
export type StatusDeConexao = z.infer<typeof StatusDeConexao>;

export const ConnectedBankDTO = z
  .object({
    id: z.string().min(1),
    nome: z.string().min(1),
    saldoEmCentavos: Centavos,
    status: StatusDeConexao,
    ultimaSincronizacao: InstanteISO.nullable(),
  })
  .strict();
export type ConnectedBankDTO = z.infer<typeof ConnectedBankDTO>;
