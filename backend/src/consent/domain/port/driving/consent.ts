import type { Consent } from '../../model/consent';

// Driving port of the consent context (ADR-001). The controller translates
// HTTP; the use case never sees a request object.

export interface ConnectInstitutionInput {
  readonly holderId: string;
  readonly institutionId: string;
  readonly scope: string;
}

export type ResultadoDaConexao =
  | { readonly tipo: 'conectada'; readonly consent: Consent }
  | { readonly tipo: 'agregador-indisponivel' }
  | { readonly tipo: 'agregador-recusou'; readonly motivo: string };

export interface ConnectInstitution {
  executar(input: ConnectInstitutionInput): Promise<ResultadoDaConexao>;
}

export interface SyncInstitutionInput {
  readonly holderId: string;
  readonly consentId: string;
  readonly agora: Date;
}

export type ResultadoDaSincronizacao =
  | { readonly tipo: 'sincronizado'; readonly consentId: string; readonly contas: number; readonly lancamentos: number }
  | { readonly tipo: 'sem-consentimento-ativo' }
  | { readonly tipo: 'nao-encontrado' }
  | { readonly tipo: 'agregador-indisponivel' }
  | { readonly tipo: 'agregador-recusou'; readonly motivo: string };

export interface SyncInstitution {
  executar(input: SyncInstitutionInput): Promise<ResultadoDaSincronizacao>;
}

export interface ListConnections {
  executar(holderId: string): Promise<readonly Consent[]>;
}