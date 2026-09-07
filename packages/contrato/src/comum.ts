import { z } from 'zod';

// Pecas reutilizadas pelo contrato. Tudo `strict()`: campo desconhecido e erro,
// porque e assim que um `formattedAmount` perdido deixa de entrar no transporte.

/** Inteiro em centavos (RN-006). Negativo e saida; positivo e entrada. */
export const Centavos = z.number().int();

/** Instante em ISO 8601 com fuso. A web formata; a API nao. */
export const InstanteISO = z.iso.datetime({ offset: true });

/** Mes de referencia (RN-003). */
export const MesDeReferencia = z.object({ ano: z.number().int().min(2000), mes: z.number().int().min(1).max(12) }).strict();
export type MesDeReferencia = z.infer<typeof MesDeReferencia>;

/** Referencia nomeada: id estavel + nome para exibir. Icone e cor sao da web. */
export const Referencia = z.object({ id: z.string().min(1), nome: z.string().min(1) }).strict();
export type Referencia = z.infer<typeof Referencia>;
