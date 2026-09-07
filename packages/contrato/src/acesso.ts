import { z } from 'zod';

// Contrato de acesso (HN-001). Nada aqui carrega senha de volta, hash ou
// qualquer coisa derivada dela: o que entra e credencial, o que sai e sessao.

/** Senha minima. Regra de produto, nao de seguranca por obscuridade. */
export const SENHA_MINIMA = 8;

export const CriarContaDTO = z
  .object({
    email: z.email().max(254),
    senha: z.string().min(SENHA_MINIMA).max(200),
  })
  .strict();
export type CriarContaDTO = z.infer<typeof CriarContaDTO>;

export const CredenciaisDTO = z
  .object({
    email: z.email().max(254),
    senha: z.string().min(1).max(200),
  })
  .strict();
export type CredenciaisDTO = z.infer<typeof CredenciaisDTO>;

/** Conta como o mundo externo a ve: sem senha, sem hash. */
export const ContaDTO = z.object({ id: z.string().min(1), email: z.email() }).strict();
export type ContaDTO = z.infer<typeof ContaDTO>;

export const SessaoDTO = z
  .object({
    conta: ContaDTO,
    /** JWT curto (~15 min), ADR-004. */
    accessToken: z.string().min(1),
    /** Opaco e revogavel; o servidor guarda apenas o hash dele. */
    refreshToken: z.string().min(1),
    expiraEm: z.iso.datetime({ offset: true }),
  })
  .strict();
export type SessaoDTO = z.infer<typeof SessaoDTO>;

export const RenovacaoDTO = z.object({ refreshToken: z.string().min(1) }).strict();
export type RenovacaoDTO = z.infer<typeof RenovacaoDTO>;
