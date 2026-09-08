import { z } from 'zod';

// Contrato de access (HN-001). Nada aqui carrega senha de volta, hash ou
// qualquer coisa derivada dela: o que entra e credencial, o que sai e session.

/** Senha minima. Regra de produto, nao de seguranca por obscuridade. */
export const SENHA_MINIMA = 8;

export const CreateAccountDTO = z
  .object({
    email: z.email().max(254),
    senha: z.string().min(SENHA_MINIMA).max(200),
  })
  .strict();
export type CreateAccountDTO = z.infer<typeof CreateAccountDTO>;

export const CredentialsDTO = z
  .object({
    email: z.email().max(254),
    senha: z.string().min(1).max(200),
  })
  .strict();
export type CredentialsDTO = z.infer<typeof CredentialsDTO>;

/** Account como o mundo externo a ve: sem senha, sem hash. */
export const AccountDTO = z.object({ id: z.string().min(1), email: z.email() }).strict();
export type AccountDTO = z.infer<typeof AccountDTO>;

export const SessionDTO = z
  .object({
    account: AccountDTO,
    /** JWT curto (~15 min), ADR-004. */
    accessToken: z.string().min(1),
    /** Opaco e revogavel; o servidor guarda apenas o hash dele. */
    refreshToken: z.string().min(1),
    expiresAt: z.iso.datetime({ offset: true }),
  })
  .strict();
export type SessionDTO = z.infer<typeof SessionDTO>;

export const RefreshDTO = z.object({ refreshToken: z.string().min(1) }).strict();
export type RefreshDTO = z.infer<typeof RefreshDTO>;
