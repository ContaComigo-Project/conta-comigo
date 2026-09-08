import { z } from 'zod';
import { ISOInstant } from './common';

// Consent contract (HN-002): connection of an institution with explicit consent.

export const ConnectInstitutionDTO = z
  .object({
    institutionId: z.string().min(1),
    scope: z.string().min(1),
  })
  .strict();
export type ConnectInstitutionDTO = z.infer<typeof ConnectInstitutionDTO>;

export const ConsentDTO = z
  .object({
    id: z.string().min(1),
    institutionId: z.string().min(1),
    scope: z.string().min(1),
    status: z.enum(['ativo', 'expirado', 'revogado']),
    createdAt: ISOInstant,
    expiresAt: ISOInstant,
    lastSyncAt: ISOInstant.nullable(),
  })
  .strict();
export type ConsentDTO = z.infer<typeof ConsentDTO>;

export const SyncResultDTO = z
  .object({
    consentId: z.string().min(1),
    contas: z.number().int().min(0),
    lancamentos: z.number().int().min(0),
  })
  .strict();
export type SyncResultDTO = z.infer<typeof SyncResultDTO>;