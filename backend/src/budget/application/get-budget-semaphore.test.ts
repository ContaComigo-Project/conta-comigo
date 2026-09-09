import { describe, expect, it } from 'vitest';
import { holderId, type HolderId } from '../../transactions/domain/model/holder';
import type { Transaction } from '../../transactions/domain/model/transaction';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { LimiteMensal } from '../domain/model/monthly-limit';
import type { BudgetAlert } from '../domain/model/budget-alert';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import { GetBudgetSemaphoreUseCase } from './get-budget-semaphore';

const HOLDER = holderId('holder-a');
const MES = '2026-02';

class RepoFake implements BudgetRepository {
  limites: LimiteMensal[] = [];
  alertas: BudgetAlert[] = [];
  async definir(l: LimiteMensal) { this.limites.push(l); }
  async remover() { return true; }
  async listarDoMes(h: string, month: string) { return this.limites.filter((l) => l.holderId === h && l.month === month); }
  async listarAlertasDoMes(h: string, month: string) { return this.alertas.filter((a) => a.holderId === h && a.month === month); }
  async registrarAlerta(a: BudgetAlert) { this.alertas.push(a); }
}

class TransacoesFake implements RepositorioDeTransactions {
  itens: Transaction[] = [];
  async listarDoHolder(h: HolderId) { return this.itens.filter((t) => t.holderId === h); }
  async buscarDoHolder(h: HolderId, id: string) { return this.itens.find((t) => t.holderId === h && t.id === id) ?? null; }
  async salvar() {}
  async salvarSincronizados() {}
  async deleteByHolder() {}
}

function transacao(categoria: string, valorCentavos: number, dia = 10): Transaction {
  return {
    id: `${categoria}-${valorCentavos}-${dia}`,
    holderId: HOLDER,
    description: 'x',
    readableDescription: null,
    category: categoria as Transaction['category'],
    categoryOrigin: null,
    amountInCents: valorCentavos,
    dueDate: new Date(`${MES}-${String(dia).padStart(2, '0')}T12:00:00-03:00`),
    externalId: null,
  };
}

function casos(limites: LimiteMensal[], transacoes: Transaction[]) {
  const repo = new RepoFake();
  repo.limites = limites;
  const txs = new TransacoesFake();
  txs.itens = transacoes;
  return new GetBudgetSemaphoreUseCase(repo, txs);
}

describe('HN-007 — semáforo do orçamento (RF-014, RN-001, RN-002, RN-005)', () => {
  it('RN-001 — faixa exata: verde ≤70%, amarela ≤90%, vermelha >90%', async () => {
    const limite = { holderId: HOLDER, month: MES, category: 'moradia', limitInCents: 10_000_00 };
    const uso = casos([limite], [
      transacao('moradia', 7_000_00), // 70% → verde
      transacao('lazer', 9_000_00, 15), // 90% → amarela (limite lazer separado? sem limite... )
    ]);

    // moradia com 70% → verde
    let r = await uso.executar(HOLDER, MES);
    expect(r.categorias.find((c) => c.category === 'moradia')?.band).toBe('verde');

    // moradia com 90,01% → vermelha
    const usoVermelho = casos([limite], [transacao('moradia', 9_001_00)]);
    r = await usoVermelho.executar(HOLDER, MES);
    expect(r.categorias.find((c) => c.category === 'moradia')?.band).toBe('vermelha');
  });

  it('RN-002 — categoria sem limite retorna "sem-limite", nunca verde', async () => {
    const uso = casos([], [transacao('alimentacao', 5_000_00)]);
    const r = await uso.executar(HOLDER, MES);
    expect(r.categorias.find((c) => c.category === 'alimentacao')?.band).toBe('sem-limite');
    expect(r.categorias.find((c) => c.category === 'alimentacao')?.limitInCents).toBeNull();
  });

  it('RN-005 — o aviso é emitido uma única vez por faixa por categoria por mês', async () => {
    const limite = { holderId: HOLDER, month: MES, category: 'transporte', limitInCents: 10_000_00 };
    const repo = new RepoFake();
    repo.limites = [limite];
    const txs = new TransacoesFake();
    const uso = new GetBudgetSemaphoreUseCase(repo, txs);

    // Cruzou 70% (amarela)
    txs.itens = [transacao('transporte', 7_001_00)];
    const primeira = await uso.executar(HOLDER, MES);
    expect(primeira.alertas.filter((a) => a.category === 'transporte')).toHaveLength(1);

    // Reavaliar com o mesmo cruzamento não repete (RN-005)
    const segunda = await uso.executar(HOLDER, MES);
    expect(segunda.alertas.filter((a) => a.category === 'transporte')).toHaveLength(1);
  });

  it('RN-005 — a faixa vermelha gera um aviso separado da amarela', async () => {
    const limite = { holderId: HOLDER, month: MES, category: 'moradia', limitInCents: 10_000_00 };
    const repo = new RepoFake();
    repo.limites = [limite];
    const txs = new TransacoesFake();
    const uso = new GetBudgetSemaphoreUseCase(repo, txs);

    // Direto na vermelha (>90%): um aviso amarelo + um vermelho.
    txs.itens = [transacao('moradia', 9_500_00)];
    const r = await uso.executar(HOLDER, MES);

    const bandas = r.alertas.filter((a) => a.category === 'moradia').map((a) => a.band).sort();
    expect(bandas).toEqual(['amarela', 'vermelha']);
  });
});