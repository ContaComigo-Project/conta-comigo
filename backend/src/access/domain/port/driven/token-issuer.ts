import type { HolderId } from '../../../../transactions/domain/model/holder';

// Porta: emitir e validar o access token curto (ADR-004). A lib de JWT fica na
// infraestrutura; o dominio so conhece esta interface.
export interface TokenEmitido {
  readonly valor: string;
  readonly expiresAt: Date;
}

export interface TokenIssuer {
  emitir(holder: HolderId): TokenEmitido;
  /** Devolve o holder, ou null se o token for invalido ou estiver expirado. */
  validar(token: string): HolderId | null;
}
