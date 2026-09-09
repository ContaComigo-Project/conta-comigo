import { mesDeReferencia } from '../../transactions/domain/reference-month';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import type { GetBudgetHistory, HistoricoDoOrcamento } from '../domain/port/driving/get-budget-history';
import { categoriasDoMes } from './por-categoria-do-mes';

// RF-016 / RF-017 / RN-022 / RN-023: histórico dos meses fechados (até 6,
// excluindo o corrente) e o ranking dos três problemas mais recorrentes —
// calculado dos dados, nunca da IA; empate pelo maior valor absoluto.
const MESES_NO_HISTORICO = 6;

function mesesFechados(anoAtual: number, mesAtual: number): string[] {
  const meses: string[] = [];
  for (let i = 1; i <= MESES_NO_HISTORICO; i += 1) {
    const d = new Date(Date.UTC(anoAtual, mesAtual - 1 - i, 1));
    meses.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return meses;
}

export class GetBudgetHistoryUseCase implements GetBudgetHistory {
  constructor(
    private readonly repo: BudgetRepository,
    private readonly transactions: RepositorioDeTransactions,
    private readonly clock: Clock,
  ) {}

  async executar(holderId: string): Promise<HistoricoDoOrcamento> {
    const corrente = mesDeReferencia(this.clock.agora());
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);

    const meses = mesesFechados(corrente.ano, corrente.mes);
    const problemas = new Map<string, { vezes: number; excesso: number }>();

    const resultadoMeses = [];
    for (const month of meses) {
      const limites = await this.repo.listarDoMes(holderId, month);
      const categorias = await categoriasDoMes(limites, transacoes, month);
      // RN-022: mês sem nenhuma categoria (nem limite nem gasto) não entra no
      // histórico — "conta com 2 meses mostra 2, sem erro".
      if (categorias.length === 0) continue;
      for (const c of categorias) {
        if (c.band !== 'vermelha') continue;
        const p = problemas.get(c.category) ?? { vezes: 0, excesso: 0 };
        p.vezes += 1;
        p.excesso += c.spentInCents - (c.limitInCents ?? 0);
        problemas.set(c.category, p);
      }
      resultadoMeses.push({ month, categorias });
    }

    const ranking = [...problemas.entries()]
      .map(([category, p]) => ({ category, vezesEmVermelho: p.vezes, excessoTotalEmCentavos: p.excesso }))
      .sort(
        (a, b) =>
          b.vezesEmVermelho - a.vezesEmVermelho || b.excessoTotalEmCentavos - a.excessoTotalEmCentavos,
      )
      .slice(0, 3);

    return { meses: resultadoMeses, problemas: ranking };
  }
}