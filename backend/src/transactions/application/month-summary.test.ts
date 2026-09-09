import { describe, expect, it } from 'vitest';
import { GetMonthSummaryUseCase } from './month-summary';
import type { Transaction } from '../domain/model/transaction';
import { holderId } from '../domain/model/holder';
import type { Clock } from '../domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../domain/port/driven/transaction-repository';

const TITULAR = holderId('holder-a');

function transaction(id: string, amountInCents: number, competenciaUtc: string): Transaction {
  return { id, holderId: TITULAR, description: 'transaction ' + id, readableDescription: null, amountInCents, dueDate: new Date(competenciaUtc) , externalId: null };
}

// Fakes construidos aqui, a partir das PORTAS. O teste de application/ nao
// importa infrastructure/ — o gate de fronteiras reprovou a primeira versao,
// que usava FixedClock e o repositorio em memory. O caso de uso so precisa
// de quem cumpra o contrato; isso e exatamente o que o hexagono promete.
const clockEm = (instanteUtc: string): Clock => ({ agora: () => new Date(instanteUtc) });
const repositorioCom = (itens: readonly Transaction[]): RepositorioDeTransactions => ({
  listarDoHolder: async () => itens,
  salvarSincronizados: async () => {},
  deleteByHolder: async () => {},
});

// Caso de uso testado sem banco, sem HTTP e sem framework.
describe('GetMonthSummary', () => {
  it('soma apenas os transactions do mes de referencia do clock (RN-003)', async () => {
    // Clock fixo em 31/01/2026 23:59 SP -> mes de referencia janeiro/2026.
    const clock = clockEm('2026-02-01T02:59:00Z');
    const repositorio = repositorioCom([
      transaction('a', 10_00, '2026-01-15T12:00:00Z'), // janeiro
      transaction('b', 25_50, '2026-02-01T02:30:00Z'), // 31/01 23:30 SP -> janeiro
      transaction('c', 99_99, '2026-02-01T03:30:00Z'), // 01/02 00:30 SP -> fevereiro
      transaction('d', 1_00, '2025-01-20T12:00:00Z'), // janeiro de OUTRO ano
    ]);

    const inicio = performance.now();
    const resumo = await new GetMonthSummaryUseCase(repositorio, clock).executar(TITULAR);
    const duracaoMs = performance.now() - inicio;

    expect(resumo.mes).toEqual({ ano: 2026, mes: 1 });
    expect(resumo.quantidade).toBe(2);
    expect(resumo.totalEmCentavos).toBe(35_50);
    expect(duracaoMs).toBeLessThan(1000);
  });

  it('sem transactions, o resumo e zero e ainda informa o mes', async () => {
    const clock = clockEm('2026-06-10T15:00:00Z');
    const resumo = await new GetMonthSummaryUseCase(repositorioCom([]), clock).executar(TITULAR);
    expect(resumo).toEqual({ mes: { ano: 2026, mes: 6 }, quantidade: 0, totalEmCentavos: 0 });
  });
});
