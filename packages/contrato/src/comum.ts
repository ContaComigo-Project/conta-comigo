import { z } from 'zod';

// Pecas reutilizadas pelo contrato. Tudo `strict()`: campo desconhecido e error,
// porque e assim que um `formattedAmount` perdido deixa de entrar no transporte.

/** Inteiro em centavos (RN-006). Negativo e saida; positivo e input. */
export const Centavos = z.number().int();

/** Instante em ISO 8601 com fuso. A web formata; a API nao. */
export const InstanteISO = z.iso.datetime({ offset: true });

/** Mes de referencia (RN-003). */
export const ReferenceMonth = z.object({ ano: z.number().int().min(2000), mes: z.number().int().min(1).max(12) }).strict();
export type ReferenceMonth = z.infer<typeof ReferenceMonth>;

/** Referencia nomeada: id estavel + nome para exibir. Icone e cor sao da web. */
export const Referencia = z.object({ id: z.string().min(1), nome: z.string().min(1) }).strict();
export type Referencia = z.infer<typeof Referencia>;
