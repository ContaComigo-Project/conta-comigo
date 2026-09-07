import type { ContaExterna, LancamentoExterno } from '../../model/conta-externa';
import type { ResultadoDaAgregacao } from '../../model/resultado-da-agregacao';

// Porta de saida OBRIGATORIA (ADR-001, regra adicional 2). O dominio pede dado
// de instituicao por aqui e nunca conhece Pluggy, HTTP ou SDK algum.
//
// `idDaConexao` e o identificador que o provedor deu ao vinculo entre a pessoa e
// a instituicao. Quem o cria e guarda e HN-002; aqui ele so e consumido.
export interface AgregadorOpenFinance {
  listarContas(idDaConexao: string): Promise<ResultadoDaAgregacao<readonly ContaExterna[]>>;

  listarLancamentos(
    idDaConexao: string,
    desde: Date,
  ): Promise<ResultadoDaAgregacao<readonly LancamentoExterno[]>>;
}
