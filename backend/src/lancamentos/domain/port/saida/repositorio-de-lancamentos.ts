import type { Lancamento } from '../../model/lancamento';
import type { TitularId } from '../../model/titular';

// Porta de saida (driven). Quem implementa e detalhe da infraestrutura.
//
// Nao existe "listar tudo": o filtro por titular e da CONSULTA, nunca de um
// passo posterior em memoria (RN-015). Uma porta que devolve tudo convida a
// filtrar depois — e filtrar depois ja vazou pelo log e pela metrica.
export interface RepositorioDeLancamentos {
  listarDoTitular(titularId: TitularId): Promise<readonly Lancamento[]>;
}
