import { mesDeReferencia, mesmoMes } from '../domain/reference-month';
import type { GetMonthSummary, ResumoDoMes } from '../domain/port/driving/month-summary';
import type { HolderId } from '../domain/model/holder';
import type { Clock } from '../domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';

// Caso de uso. Recebe portas por construtor; nao sabe quem as implementa.
// Sem @Injectable: a ligacao por token acontece no modulo (ADR-001, regra 3).
export class GetMonthSummaryUseCase implements GetMonthSummary {
  constructor(
    private readonly repositorio: RepositorioDeTransactions,
    private readonly clock: Clock,
  ) {}

  async executar(holderId: HolderId): Promise<ResumoDoMes> {
    const mes = mesDeReferencia(this.clock.agora());
    const doMes = (await this.repositorio.listarDoHolder(holderId)).filter((l) =>
      mesmoMes(mesDeReferencia(l.dueDate), mes),
    );
    return {
      mes,
      quantidade: doMes.length,
      totalEmCentavos: doMes.reduce((soma, l) => soma + l.amountInCents, 0),
    };
  }
}
