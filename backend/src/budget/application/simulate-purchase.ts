import { mesDeReferencia } from '../../transactions/domain/reference-month';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import { faixaDoSemaforo } from '../domain/budget-band';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import type { ResultadoDaSimulacao, SimularPlanoDeCompra } from '../domain/port/driving/simulate-purchase';
import { categoriasDoMes } from './por-categoria-do-mes';

// RF-022: simular um plano de compra dentro do orçamento. Recalcula o
// semáforo do mês com o gasto extra na categoria e devolve o impacto. RN-017:
// a resposta NUNCA recomenda crédito ou parcelamento — mostra só o efeito nos
// números, e quem decide é a pessoa.
export class SimularPlanoDeCompraUseCase implements SimularPlanoDeCompra {
  constructor(
    private readonly repo: BudgetRepository,
    private readonly transactions: RepositorioDeTransactions,
    private readonly clock: Clock,
  ) {}

  async executar(holderId: string, categoria: string, valorEmCentavos: number, month?: string): Promise<ResultadoDaSimulacao> {
    if (valorEmCentavos <= 0) {
      const e = new Error('valorEmCentavos deve ser positivo');
      e.name = 'InvalidArgumentError';
      throw e;
    }

    const m = month ?? `${mesDeReferencia(this.clock.agora()).ano}-${String(mesDeReferencia(this.clock.agora()).mes).padStart(2, '0')}`;
    const limites = await this.repo.listarDoMes(holderId, m);
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);
    const base = await categoriasDoMes(limites, transacoes, m);

    const categorias = base.map((c) => {
      const comImpacto = c.category === categoria;
      const totalComImpacto = c.spentInCents + (comImpacto ? valorEmCentavos : 0);
      return {
        category: c.category,
        limitInCents: c.limitInCents,
        spentInCents: c.spentInCents,
        band: c.band,
        bandComImpacto: comImpacto ? faixaDoSemaforo(totalComImpacto, c.limitInCents) : c.band,
        impactoEmCentavos: comImpacto ? valorEmCentavos : 0,
      };
    });

    return { month: m, categorias };
  }
}