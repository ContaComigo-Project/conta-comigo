import { z } from 'zod';
import { Cents, ISOInstant } from './common';

// Instituicao conectada. Saldo em centavos; cor e iniciais sao da web.
export const ConnectionStatus = z.enum(['ativo', 'sincronizando', 'error']);
export type ConnectionStatus = z.infer<typeof ConnectionStatus>;

export const ConnectedBankDTO = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    saldoEmCents: Cents,
    status: ConnectionStatus,
    ultimaSincronizacao: ISOInstant.nullable(),
  })
  .strict();
export type ConnectedBankDTO = z.infer<typeof ConnectedBankDTO>;
