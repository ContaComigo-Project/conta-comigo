import { describe, expect, it } from 'vitest';
import { ConsultarResumoDoMesUseCase } from './consultar-resumo-do-mes';
import type { Lancamento } from '../domain/model/lancamento';
import type { Relogio } from '../domain/port/saida/relogio';
import type { RepositorioDeLancamentos } from '../domain/port/saida/repositorio-de-lancamentos';

function lancamento(id: string, valorEmCentavos: number, competenciaUtc: string): Lancamento {
  return { id, descricao: 'lancamento ' + id, valorEmCentavos, dataDeCompetencia: new Date(competenciaUtc) };
}

// Fakes construidos aqui, a partir das PORTAS. O teste de application/ nao
// importa infrastructure/ — o gate de fronteiras reprovou a primeira versao,
// que usava RelogioFixo e o repositorio em memoria. O caso de uso so precisa
// de quem cumpra o contrato; isso e exatamente o que o hexagono promete.
const relogioEm = (instanteUtc: string): Relogio => ({ agora: () => new Date(instanteUtc) });
const repositorioCom = (itens: readonly Lancamento[]): RepositorioDeLancamentos => ({
  listarTodos: async () => itens,
});

// Caso de uso testado sem banco, sem HTTP e sem framework.
describe('ConsultarResumoDoMes', () => {
  it('soma apenas os lancamentos do mes de referencia do relogio (RN-003)', async () => {
    // Relogio fixo em 31/01/2026 23:59 SP -> mes de referencia janeiro/2026.
    const relogio = relogioEm('2026-02-01T02:59:00Z');
    const repositorio = repositorioCom([
      lancamento('a', 10_00, '2026-01-15T12:00:00Z'), // janeiro
      lancamento('b', 25_50, '2026-02-01T02:30:00Z'), // 31/01 23:30 SP -> janeiro
      lancamento('c', 99_99, '2026-02-01T03:30:00Z'), // 01/02 00:30 SP -> fevereiro
      lancamento('d', 1_00, '2025-01-20T12:00:00Z'), // janeiro de OUTRO ano
    ]);

    const inicio = performance.now();
    const resumo = await new ConsultarResumoDoMesUseCase(repositorio, relogio).executar();
    const duracaoMs = performance.now() - inicio;

    expect(resumo.mes).toEqual({ ano: 2026, mes: 1 });
    expect(resumo.quantidade).toBe(2);
    expect(resumo.totalEmCentavos).toBe(35_50);
    expect(duracaoMs).toBeLessThan(1000);
  });

  it('sem lancamentos, o resumo e zero e ainda informa o mes', async () => {
    const relogio = relogioEm('2026-06-10T15:00:00Z');
    const resumo = await new ConsultarResumoDoMesUseCase(repositorioCom([]), relogio).executar();
    expect(resumo).toEqual({ mes: { ano: 2026, mes: 6 }, quantidade: 0, totalEmCentavos: 0 });
  });
});
