import { mesDeReferencia } from '../../transactions/domain/reference-month';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import type { AiAdvisor } from '../domain/port/driven/ai-advisor';
import type { PerguntarNoChat, RespostaDoChat } from '../domain/port/driving/chat';

// RN-018: toda superfície com saída de IA carrega o aviso de não
// aconselhamento. Vive no domínio porque é regra do produto, e o backend a
// entrega junto da resposta — a tela não pode esquecê-la.
export const AVISO_DE_NAO_ACONSELHAMENTO =
  'O Consultor IA é educativo e usa seus números, mas não é aconselhamento financeiro. ' +
  'Não recomenda produtos, investimentos, crédito ou instituições. Consulte um profissional qualificado.';

// RF-020 / RN-019: a resposta usa o dado da pessoa — o modelo recebe o resumo
// do mês fechado mais recente (valores agregados, sem identidade) e interpreta
// a pergunta livre. Provedor fora ou resposta bloqueada degrada (RN-021).
export class PerguntarNoChatUseCase implements PerguntarNoChat {
  constructor(
    private readonly transactions: RepositorioDeTransactions,
    private readonly clock: Clock,
    private readonly advisor: AiAdvisor,
  ) {}

  async executar(holderId: string, pergunta: string): Promise<RespostaDoChat> {
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);

    const gastosPorCategoria = new Map<string, number>();
    for (const t of transacoes) {
      if (!t.category) continue;
      gastosPorCategoria.set(t.category, (gastosPorCategoria.get(t.category) ?? 0) + t.amountInCents);
    }
    const resumo = [...gastosPorCategoria.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoria, total]) => ({ categoria, totalEmCentavos: total }));

    const resultado = await this.advisor.aconselhar({
      holder: holderId,
      tipo: 'pergunta-livre',
      pergunta,
      dados: { resumoDoGasto: resumo },
    });

    if (resultado.tipo === 'ok') {
      return { tipo: 'ok', resposta: resultado.dados.texto, aviso: AVISO_DE_NAO_ACONSELHAMENTO };
    }
    switch (resultado.motivo) {
      case 'teto-atingido':
        return { tipo: 'teto-atingido' };
      case 'resposta-bloqueada':
        return { tipo: 'ia-bloqueou', motivo: resultado.detalhe };
      default:
        return { tipo: 'ia-indisponivel', motivo: resultado.detalhe };
    }
  }
}