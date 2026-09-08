import { z } from 'zod';

// Envelope de toda response da API. Erro e "dados insuficientes" sao estados de
// primeira classe (RN-020, RN-021), nao `null` ambiguo: a tela decide o que
// mostrar olhando `estado`, e o painel numerico nunca esvazia porque a IA caiu.

export const CodigoDeErro = z.enum([
  'provedor-indisponivel', // aggregator ou IA fora (RN-021 degrada so o bloco)
  'nao-autorizado',
  'nao-encontrado',
  'invalido',
  'interno',
]);
export type CodigoDeErro = z.infer<typeof CodigoDeErro>;

export function resultadoDe<T extends z.ZodTypeAny>(dados: T) {
  return z.discriminatedUnion('estado', [
    z.object({ estado: z.literal('ok'), dados }).strict(),
    z.object({ estado: z.literal('error'), codigo: CodigoDeErro, mensagem: z.string().min(1) }).strict(),
    z.object({ estado: z.literal('dados-insuficientes'), motivo: z.string().min(1) }).strict(),
  ]);
}

export type Result<T> =
  | { estado: 'ok'; dados: T }
  | { estado: 'error'; codigo: CodigoDeErro; mensagem: string }
  | { estado: 'dados-insuficientes'; motivo: string };

export const ok = <T>(dados: T): Result<T> => ({ estado: 'ok', dados });
export const error = (codigo: CodigoDeErro, mensagem: string): Result<never> => ({ estado: 'error', codigo, mensagem });
export const dadosInsuficientes = (motivo: string): Result<never> => ({ estado: 'dados-insuficientes', motivo });
