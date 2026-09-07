import type { TitularId } from '../../../../lancamentos/domain/model/titular';

// O refresh e guardado em HASH: se o banco vazar, os refresh nao sao utilizaveis.
export interface Sessao {
  readonly id: string;
  readonly titularId: TitularId;
  readonly hashDoRefresh: string;
  readonly expiraEm: Date;
  readonly revogadoEm: Date | null;
}

export interface RepositorioDeSessoes {
  criar(sessao: Sessao): Promise<void>;
  porHashDoRefresh(hash: string): Promise<Sessao | null>;
  revogar(id: string, quando: Date): Promise<void>;
}
