import { describe, expect, it } from 'vitest';
import { holderId } from '../domain/model/holder';
import type { ExternalAccount } from '../domain/model/external-account';
import type { Transaction } from '../domain/model/transaction';
import type { ExternalAccountRepository } from '../domain/port/driven/external-account-repository';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';
import type { Clock } from '../domain/port/driven/clock';
import { GetConsolidatedSummaryUseCase } from './consolidated-summary';

const HOLDER_A = holderId('holder-a');
const HOLDER_B = holderId('holder-b');
const AGORA = new Date('2026-02-15T12:00:00Z');

class ContasFake implements ExternalAccountRepository {
  private dados: ExternalAccount[] = [];
  async salvarSincronizadas(c: readonly ExternalAccount[]) { this.dados = [...c]; }
  async listarDoHolder(h: typeof HOLDER_A) { return this.dados.filter((x) => x.holderId === h); }
}

class LancamentosFake implements RepositorioDeTransactions {
  private dados: Transaction[] = [];
  async listarDoHolder(h: typeof HOLDER_A) { return this.dados.filter((x) => x.holderId === h); }
  async salvarSincronizados(l: readonly Transaction[]) { this.dados.push(...l); }
  async deleteByHolder() {}
}

const conta = (holderId: typeof HOLDER_A, type: 'corrente' | 'poupanca' | 'cartao-de-credito', balanceInCents: number): ExternalAccount => ({
  id: `${holderId}-${type}`, holderId, externalId: `${type}-${holderId}`, institutionId: 'inst', type, balanceInCents,
});

const lancamento = (holderId: typeof HOLDER_A, amountInCents: number, dueDate: Date): Transaction => ({
  id: `${holderId}-${amountInCents}-${dueDate.getTime()}`, holderId, description: 'x', readableDescription: null, amountInCents, dueDate, externalId: null,
});

const relogio = (instante: Date): Clock => ({ agora: () => instante });

describe('HN-003 — resumo consolidado (RF-008, RF-009, RN-006..009, RN-015)', () => {
  it('RN-009 — saldo total soma contas ativas e a fatura do cartão fica separada', async () => {
    const contas = new ContasFake();
    contas.salvarSincronizadas([
      conta(HOLDER_A, 'corrente', 241_832),
      conta(HOLDER_A, 'poupanca', 1_084_213),
      conta(HOLDER_A, 'cartao-de-credito', -87_450),
    ]);
    const caso = new GetConsolidatedSummaryUseCase(contas, new LancamentosFake(), relogio(AGORA));

    const resumo = await caso.executar(HOLDER_A);

    expect(resumo.saldoTotalEmCentavos).toBe(241_832 + 1_084_213);
    expect(resumo.faturaDoCartaoEmCentavos).toBe(-87_450);
  });

  it('RN-009 — conta com saldo negativo reduz o total', async () => {
    const contas = new ContasFake();
    contas.salvarSincronizadas([conta(HOLDER_A, 'corrente', -50_000), conta(HOLDER_A, 'poupanca', 10_000)]);
    const caso = new GetConsolidatedSummaryUseCase(contas, new LancamentosFake(), relogio(AGORA));

    const resumo = await caso.executar(HOLDER_A);
    expect(resumo.saldoTotalEmCentavos).toBe(-40_000);
  });

  it('RN-007 — estorno não infla o gasto do mês', async () => {
    const lancamentos = new LancamentosFake();
    await lancamentos.salvarSincronizados([
      lancamento(HOLDER_A, -100_00, new Date('2026-02-01T12:00:00Z')), // débito
      lancamento(HOLDER_A, 100_00, new Date('2026-02-03T12:00:00Z')), // estorno (crédito)
    ]);
    const caso = new GetConsolidatedSummaryUseCase(new ContasFake(), lancamentos, relogio(AGORA));

    const resumo = await caso.executar(HOLDER_A);

    // O gasto (soma dos débitos) não é inflado pelo estorno (crédito).
    expect(resumo.gastosDoMesEmCentavos).toBe(-100_00);
    expect(resumo.receitasDoMesEmCentavos).toBe(100_00);
    expect(resumo.quantidadeDeLancamentos).toBe(2);
  });

  it('RN-006 — valores em centavos (inteiros)', async () => {
    const lancamentos = new LancamentosFake();
    await lancamentos.salvarSincronizados([lancamento(HOLDER_A, -2_349, new Date('2026-02-01T12:00:00Z'))]);
    const caso = new GetConsolidatedSummaryUseCase(new ContasFake(), lancamentos, relogio(AGORA));

    const resumo = await caso.executar(HOLDER_A);
    expect(Number.isInteger(resumo.gastosDoMesEmCentavos)).toBe(true);
    expect(resumo.gastosDoMesEmCentavos).toBe(-2_349);
  });

  it('RN-015 — o resumo só enxerga o próprio titular', async () => {
    const lancamentos = new LancamentosFake();
    await lancamentos.salvarSincronizados([
      lancamento(HOLDER_A, -100_00, new Date('2026-02-01T12:00:00Z')),
      lancamento(HOLDER_B, -999_00, new Date('2026-02-01T12:00:00Z')),
    ]);
    const caso = new GetConsolidatedSummaryUseCase(new ContasFake(), lancamentos, relogio(AGORA));

    const resumo = await caso.executar(HOLDER_A);
    expect(resumo.gastosDoMesEmCentavos).toBe(-100_00);
    expect(resumo.quantidadeDeLancamentos).toBe(1);
  });
});