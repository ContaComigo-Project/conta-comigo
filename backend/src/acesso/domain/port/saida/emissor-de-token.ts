import type { TitularId } from '../../../../lancamentos/domain/model/titular';

// Porta: emitir e validar o access token curto (ADR-004). A lib de JWT fica na
// infraestrutura; o dominio so conhece esta interface.
export interface TokenEmitido {
  readonly valor: string;
  readonly expiraEm: Date;
}

export interface EmissorDeToken {
  emitir(titular: TitularId): TokenEmitido;
  /** Devolve o titular, ou null se o token for invalido ou estiver expirado. */
  validar(token: string): TitularId | null;
}
