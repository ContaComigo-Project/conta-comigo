import { z } from 'zod';
import { Centavos, InstanteISO } from './comum';

// Instituicao conectada. Saldo em centavos; cor e iniciais sao da web.
export const StatusDeConexao = z.enum(['ativo', 'sincronizando', 'erro']);
export type StatusDeConexao = z.infer<typeof StatusDeConexao>;

export const BancoConectadoDTO = z
  .object({
    id: z.string().min(1),
    nome: z.string().min(1),
    saldoEmCentavos: Centavos,
    status: StatusDeConexao,
    ultimaSincronizacao: InstanteISO.nullable(),
  })
  .strict();
export type BancoConectadoDTO = z.infer<typeof BancoConectadoDTO>;
