import { mesDeReferencia, mesmoMes, type ReferenceMonth } from '../domain/reference-month';
import { eContaAtiva } from '../domain/model/external-account';
import type { GetConsolidatedSummary, ResumoConsolidado } from '../domain/port/driving/consolidated-summary';
import type { HolderId } from '../domain/model/holder';
import type { Clock } from '../domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';
import type { ExternalAccountRepository } from '../domain/port/driven/external-account-repository';

// RF-008 / RN-009: the consolidated panel. Active accounts sum into the total
// balance; the credit card enters as a bill, never into the balance. The month
// summary splits debits (expenses) and credits (income) — a reversal is a
// credit and never inflates expenses (RN-007). Everything scoped by holder
// (RN-015).
export class GetConsolidatedSummaryUseCase implements GetConsolidatedSummary {
  constructor(
    private readonly contas: ExternalAccountRepository,
    private readonly repositorio: RepositorioDeTransactions,
    private readonly clock: Clock,
  ) {}

  async executar(holderId: HolderId): Promise<ResumoConsolidado> {
    const mes = mesDeReferencia(this.clock.agora());

    const contas = await this.contas.listarDoHolder(holderId);
    const ativas = contas.filter((c) => eContaAtiva(c.type));
    const saldoTotalEmCentavos = ativas.reduce((soma, c) => soma + c.balanceInCents, 0);
    const faturaDoCartaoEmCentavos = contas
      .filter((c) => !eContaAtiva(c.type))
      .reduce((soma, c) => soma + c.balanceInCents, 0);

    const doMes = (await this.repositorio.listarDoHolder(holderId)).filter((l) =>
      mesmoMes(mesDeReferencia(l.dueDate), mes),
    );
    const gastosDoMesEmCentavos = doMes
      .filter((l) => l.amountInCents < 0)
      .reduce((soma, l) => soma + l.amountInCents, 0);
    const receitasDoMesEmCentavos = doMes
      .filter((l) => l.amountInCents > 0)
      .reduce((soma, l) => soma + l.amountInCents, 0);

    return {
      mes,
      saldoTotalEmCentavos,
      faturaDoCartaoEmCentavos,
      gastosDoMesEmCentavos,
      receitasDoMesEmCentavos,
      quantidadeDeLancamentos: doMes.length,
    };
  }
}