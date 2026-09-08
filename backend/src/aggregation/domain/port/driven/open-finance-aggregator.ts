import type { AccountExterna, TransactionExterno } from '../../model/external-account';
import type { ResultDaAgregacao } from '../../model/aggregation-result';

// Porta de saida OBRIGATORIA (ADR-001, regra adicional 2). O dominio pede dado
// de instituicao por aqui e nunca conhece Pluggy, HTTP ou SDK algum.
//
// `idDaConexao` e o identificador que o provedor deu ao vinculo entre a pessoa e
// a instituicao. Quem o cria e guarda e HN-002; aqui ele so e consumido.
export interface OpenFinanceAggregator {
  listarAccounts(idDaConexao: string): Promise<ResultDaAgregacao<readonly AccountExterna[]>>;

  listarTransactions(
    idDaConexao: string,
    desde: Date,
  ): Promise<ResultDaAgregacao<readonly TransactionExterno[]>>;
}
