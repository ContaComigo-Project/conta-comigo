import { mesDeReferencia } from '../../transactions/domain/reference-month';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import type { AiAdvisor } from '../../intelligence/domain/port/driven/ai-advisor';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import type { GetDiagnosis, ResultadoDoDiagnostico } from '../domain/port/driving/get-diagnosis';
import { categoriasDoMes } from './por-categoria-do-mes';

// RF-018 / RN-020 / RN-019 / RN-021: diagnóstico de saúde financeira a partir
// dos dados consolidados. O modelo recebe SÓ os números agregados (nunca a
// pessoa, RN-019) e a guarda de saída (HT-014) valida o texto. Sem um mês
// fechado com lançamentos, não há diagnóstico (RN-020). Provedor fora ou
// resposta bloqueada degrada em resultado estruturado (RN-021).
const MESES_NO_DIAGNOSTICO = 6;

function mesesFechados(anoAtual: number, mesAtual: number): string[] {
  const meses: string[] = [];
  for (let i = 1; i <= MESES_NO_DIAGNOSTICO; i += 1) {
    const d = new Date(Date.UTC(anoAtual, mesAtual - 1 - i, 1));
    meses.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return meses;
}

export class GetDiagnosisUseCase implements GetDiagnosis {
  constructor(
    private readonly repo: BudgetRepository,
    private readonly transactions: RepositorioDeTransactions,
    private readonly clock: Clock,
    private readonly advisor: AiAdvisor,
  ) {}

  async executar(holderId: string): Promise<ResultadoDoDiagnostico> {
    const corrente = mesDeReferencia(this.clock.agora());
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);

    const mesesComDados: Array<{
      month: string;
      totalGastoEmCentavos: number;
      totalLimiteEmCentavos: number;
      categoriasDeAtencao: Array<{ category: string; spentInCents: number; limitInCents: number | null; band: string }>;
    }> = [];
    for (const month of mesesFechados(corrente.ano, corrente.mes)) {
      const limites = await this.repo.listarDoMes(holderId, month);
      const categorias = await categoriasDoMes(limites, transacoes, month);
      if (categorias.length === 0) continue;
      const comLimite = categorias.filter((c) => c.limitInCents !== null);
      // Resumo compacto para o modelo: só totais + categorias de atenção. Um
      // payload grande faz o Gemini estourar o limite de espera (RNF-006).
      mesesComDados.push({
        month,
        totalGastoEmCentavos: comLimite.reduce((s, c) => s + c.spentInCents, 0),
        totalLimiteEmCentavos: comLimite.reduce((s, c) => s + (c.limitInCents ?? 0), 0),
        categoriasDeAtencao: categorias
          .filter((c) => c.band === 'amarela' || c.band === 'vermelha')
          .map((c) => ({ category: c.category, spentInCents: c.spentInCents, limitInCents: c.limitInCents, band: c.band })),
      });
    }

    // RN-020: conta recém-conectada (sem mês fechado com lançamentos) não recebe diagnóstico.
    if (mesesComDados.length === 0) return { tipo: 'dados-insuficientes' };

    const resultado = await this.advisor.aconselhar({
      holder: holderId,
      tipo: 'diagnostico-do-mes',
      pergunta: 'Descreva o diagnóstico de saúde financeira deste orçamento a partir dos números fornecidos, em linguagem simples.',
      dados: { meses: mesesComDados },
    });

    if (resultado.tipo === 'ok') return { tipo: 'ok', texto: resultado.dados.texto };
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