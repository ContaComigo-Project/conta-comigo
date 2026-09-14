import { describe, expect, it } from 'vitest';
import { holderId, type HolderId } from '../../transactions/domain/model/holder';
import type { Transaction } from '../../transactions/domain/model/transaction';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { LimiteMensal } from '../domain/model/monthly-limit';
import type { BudgetAlert } from '../domain/model/budget-alert';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import { GetBudgetHistoryUseCase } from './get-budget-history';

const HOLDER = holderId('holder-a');

class RepoFake implements BudgetRepository {
  limites: LimiteMensal[] = [];
  async definir(l: LimiteMensal) { this.limites.push(l); }
  async remover() { return true; }
  async listarDoMes(h: string, month: string) { return this.limites.filter((l) => l.holderId === h && l.month === month); }
  async listarAlertasDoMes() { return []; }
  async registrarAlerta() {}
}

class TransacoesFake implements RepositorioDeTransactions {
  itens: Transaction[] = [];
  async listarDoHolder(h: HolderId) { return this.itens.filter((t) => t.holderId === h); }
  async buscarDoHolder(h: HolderId, id: string) { return this.itens.find((t) => t.holderId === h && t.id === id) ?? null; }
  async salvar() {}
  async salvarSincronizados() {}
  async deleteByHolder() {}
}

const relogio = (ano: number, mes: number): Clock => ({ agora: () => new Date(Date.UTC(ano, mes - 1, 15)) });

function transacao(categoria: string, valorCentavos: number, month: string): Transaction {
  const [ano, mes] = month.split('-').map(Number);
  return {
    id: `${categoria}-${valorCentavos}-${month}`,
    holderId: HOLDER,
    description: 'x',
    readableDescription: null,
    category: categoria as Transaction['category'],
    categoryOrigin: null,
    amountInCents: valorCentavos,
    dueDate: new Date(Date.UTC(ano, mes - 1, 10, 12)),
    externalId: null,
  };
}

function casos(limites: LimiteMensal[], transacoes: Transaction[], relogio: Clock) {
  const repo = new RepoFake();
  repo.limites = limites;
  const txs = new TransacoesFake();
  txs.itens = transacoes;
  return new GetBudgetHistoryUseCase(repo, txs, relogio);
}

describe('HN-008 — histórico de 6 meses (RF-016, RN-022, RF-017, RN-023)', () => {
  it('RN-022 — a janela não passa de 6 meses fechados (exclui o corrente)', async () => {
    // Corrente: março/2026. Dados em jan e fev → 2 meses no histórico.
    const limite = { holderId: HOLDER, month: '2026-01', category: 'moradia', limitInCents: 10_000_00 };
    const uso = casos(
      [limite, { ...limite, month: '2026-02' }],
      [
        transacao('moradia', -5_000_00, '2026-01'),
        transacao('moradia', -6_000_00, '2026-02'),
      ],
      relogio(2026, 3),
    );

    const r = await uso.executar(HOLDER);

    // Mês corrente (março) não entra; só os meses com dados (jan/fev).
    expect(r.meses.map((m) => m.month).sort()).toEqual(['2026-01', '2026-02']);
    expect(r.meses.length).toBeLessThanOrEqual(6);
  });

  it('RF-016 — cada mês traz gasto, limite e faixa por categoria', async () => {
    const uso = casos(
      [{ holderId: HOLDER, month: '2026-02', category: 'moradia', limitInCents: 10_000_00 }],
      [transacao('moradia', -8_000_00, '2026-02')], // 80% → amarela
      relogio(2026, 3),
    );

    const r = await uso.executar(HOLDER);
    const mes = r.meses.find((m) => m.month === '2026-02');
    const moradia = mes?.categorias.find((c) => c.category === 'moradia');
    expect(moradia?.spentInCents).toBe(8_000_00);
    expect(moradia?.limitInCents).toBe(10_000_00);
    expect(moradia?.band).toBe('amarela');
  });

it('RF-017/RN-023 — o ranking vem dos dados e é desempatado pelo maior valor absoluto', async () => {
    // moradia estoura 3 meses; lazer estoura 3 meses também (empate na
    // recorrência) mas com excesso menor → moradia vence (maior valor absoluto).
    // Excesso = quanto passou do início da faixa vermelha (90% do limite).
    const meses = ['2026-01', '2026-02', '2026-03'];
    const limiteMoradia = { holderId: HOLDER, month: '', category: 'moradia', limitInCents: 10_000_00 };
    const limiteLazer = { holderId: HOLDER, month: '', category: 'lazer', limitInCents: 10_000_00 };
    const limites = [
      ...meses.map((m) => ({ ...limiteMoradia, month: m })),
      ...meses.map((m) => ({ ...limiteLazer, month: m })),
    ];
    const transacoes = [
      // moradia: 11.000 em cada mês (110% → excesso 2.000/mês)
      ...meses.map((m) => transacao('moradia', -11_000_00, m)),
      // lazer: 10.500 em cada mês (105% → excesso 1.500/mês)
      ...meses.map((m) => transacao('lazer', -10_500_00, m)),
    ];

    const uso = casos(limites, transacoes, relogio(2026, 4));
    const r = await uso.executar(HOLDER);

    expect(r.problemas[0].category).toBe('moradia'); // mais recorrente E maior excesso
    expect(r.problemas[0].vezesEmVermelho).toBe(3);
    expect(r.problemas[0].excessoTotalEmCentavos).toBe(6_000_00); // 3 × 2.000
    expect(r.problemas.length).toBeLessThanOrEqual(3);
  });
});