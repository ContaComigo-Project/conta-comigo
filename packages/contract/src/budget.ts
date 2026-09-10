import { z } from 'zod';
import { Cents, ReferenceMonth, Reference } from './common';

// A faixa vem CALCULADA do dominio (RN-001, RN-002). A tela nunca recalcula:
// se recalculasse, 70,04% poderia virar verde em um lugar e amarela em outro.
export const Faixa = z.enum(['verde', 'amarela', 'vermelha', 'sem-limite']);
export type Faixa = z.infer<typeof Faixa>;

export const BudgetCategoryDTO = z
  .object({
    category: Reference,
    month: ReferenceMonth,
    /** `null` = sem limite definido (RN-002): faixa e "sem-limite", nunca verde. */
    limiteEmCents: Cents.nullable(),
    gastoEmCents: Cents,
    faixa: Faixa,
  })
  .strict();
export type BudgetCategoryDTO = z.infer<typeof BudgetCategoryDTO>;

// Limite mensal por categoria (HN-006, RF-013). Valor em CENTAVOS (RN-006);
// ausencia de item na lista significa "sem limite" (RN-002), e nao zero.
export const MonthlyLimitDTO = z
  .object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), category: z.string().min(1), limiteEmCents: Cents })
  .strict();
export type MonthlyLimitDTO = z.infer<typeof MonthlyLimitDTO>;

export const DefinirLimiteDTO = z.object({ limiteEmCents: Cents }).strict();
export type DefinirLimiteDTO = z.infer<typeof DefinirLimiteDTO>;

// Budget semaphore per category for a month (HN-007): band per RN-001/RN-002
// and the band-crossing alerts (RN-005).
export const BudgetSemaphoreDTO = z
  .object({
    month: z.string(),
    categorias: z
      .array(
        z
          .object({
            category: z.string(),
            limitInCents: z.number().int().nullable(),
            spentInCents: z.number().int(),
            percentage: z.number(),
            band: z.enum(['verde', 'amarela', 'vermelha', 'sem-limite']),
          })
          .strict(),
      ),
    alertas: z
      .array(
        z
          .object({ category: z.string(), band: z.enum(['amarela', 'vermelha']), month: z.string() })
          .strict(),
      ),
  })
  .strict();
export type BudgetSemaphoreDTO = z.infer<typeof BudgetSemaphoreDTO>;

// Six-month history per category and the top recurrent problems (HN-008).
export const BudgetHistoryDTO = z
  .object({
    meses: z
      .array(
        z
          .object({
            month: z.string(),
            categorias: z
              .array(
                z
                  .object({
                    category: z.string(),
                    limitInCents: z.number().int().nullable(),
                    spentInCents: z.number().int(),
                    band: z.enum(['verde', 'amarela', 'vermelha', 'sem-limite']),
                  })
                  .strict(),
              ),
          })
          .strict(),
      ),
    problemas: z
      .array(
        z
          .object({
            category: z.string(),
            vezesEmVermelho: z.number().int(),
            excessoTotalEmCentavos: z.number().int(),
          })
          .strict(),
      ),
  })
  .strict();
export type BudgetHistoryDTO = z.infer<typeof BudgetHistoryDTO>;

// Financial diagnosis from the consolidated data (HN-009). The text is IA
// output already guarded (RN-019); the state covers degradation (RN-021).
export const DiagnosisDTO = z
  .object({
    estado: z.enum(['ok', 'dados-insuficientes', 'ia-indisponivel', 'teto-atingido', 'ia-bloqueou']),
    texto: z.string().optional(),
    motivo: z.string().optional(),
    contingencia: z.boolean().optional(),
    contingenciaDetalhe: z.string().optional(),
  })
  .strict();
export type DiagnosisDTO = z.infer<typeof DiagnosisDTO>;

// Educational chat (HN-010). The answer uses the person's own data (RF-020)
// and always carries the non-advice notice (RN-018).
export const PerguntaChatDTO = z.object({ pergunta: z.string().trim().min(1).max(500) }).strict();
export type PerguntaChatDTO = z.infer<typeof PerguntaChatDTO>;

export const ChatRespostaDTO = z
  .object({
    estado: z.enum(['ok', 'ia-indisponivel', 'teto-atingido', 'ia-bloqueou']),
    resposta: z.string().optional(),
    aviso: z.string().optional(),
    motivo: z.string().optional(),
    contingencia: z.boolean().optional(),
    contingenciaDetalhe: z.string().optional(),
  })
  .strict();
export type ChatRespostaDTO = z.infer<typeof ChatRespostaDTO>;

// Purchase simulation (HN-011/RF-022): impact of a planned purchase on the
// month's semaphore. The answer never recommends credit (RN-017).
export const SimulacaoDTO = z
  .object({ categoria: z.string().min(1), valorEmCentavos: z.number().int().positive(), month: z.string().optional() })
  .strict();
export type SimulacaoDTO = z.infer<typeof SimulacaoDTO>;

export const ResultadoSimulacaoDTO = z
  .object({
    month: z.string(),
    categorias: z
      .array(
        z
          .object({
            category: z.string(),
            limitInCents: z.number().int().nullable(),
            spentInCents: z.number().int(),
            band: z.string(),
            bandComImpacto: z.string(),
            impactoEmCentavos: z.number().int(),
          })
          .strict(),
      ),
  })
  .strict();
export type ResultadoSimulacaoDTO = z.infer<typeof ResultadoSimulacaoDTO>;
