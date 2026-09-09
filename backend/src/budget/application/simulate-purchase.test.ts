import { describe, expect, it } from 'vitest';
import { holderId, type HolderId } from '../../transactions/domain/model/holder';
import type { Transaction } from '../../transactions/domain/model/transaction';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { LimiteMensal } from '../domain/model/monthly-limit';
import type { BudgetAlert } from '../domain/model/budget-alert';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import { SimularPlanoDeCompraUseCase } from './simulate-purchase';

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

const relogio: Clock = { agora: () => new Date(Date.UTC(2026, 8, 15)) };

function transacao(categoria: string, valorCentavos: number): Transaction {
  return {
    id: `${categoria}-${valorCentavos}`,
    holderId: HOLDER,
    description: 'x',
    readableDescription: null,
    category: categoria as Transaction['category'],
    categoryOrigin: null,
    amountInCents: valorCentavos,
    dueDate: new Date(Date.UTC(2026, 8, 10, 12)),
    externalId: null,
  };
}

describe('HN-011 — simulação de compra (RF-022, RN-017)', () => {
  it('RF-022 — mostra o impacto no semáforo quando o gasto estoura o limite', async () => {
    const repo = new RepoFake();
    repo.limites = [{ holderId: HOLDER, month: '2026-09', category: 'moradia', limitInCents: 10_000_00 }];
    const txs = new TransacoesFake();
    txs.itens = [transacao('moradia', 8_000_00)]; // 80% → amarela
    const uso = new SimularPlanoDeCompraUseCase(repo, txs, relogio);

    const r = await uso.executar(HOLDER, 'moradia', 3_000_00); // total 11.000 → vermelha

    const moradia = r.categorias.find((c) => c.category === 'moradia')!;
    expect(moradia.band).toBe('amarela');
    expect(moradia.bandComImpacto).toBe('vermelha');
    expect(moradia.impactoEmCentavos).toBe(3_000_00);
  });

  it('RN-017 — a resposta não contém texto de crédito ou parcelamento', async () => {
    const repo = new RepoFake();
    repo.limites = [{ holderId: HOLDER, month: '2026-09', category: 'moradia', limitInCents: 10_000_00 }];
    const uso = new SimularPlanoDeCompraUseCase(repo, new TransacoesFake(), relogio);

    const r = await uso.executar(HOLDER, 'moradia', 1_000_00);
    const json = JSON.stringify(r);
    expect(json).not.toMatch(/crédito|parcel|financ|cartão|juros/i);
  });

  it('valor não positivo é recusado', async () => {
    const uso = new SimularPlanoDeCompraUseCase(new RepoFake(), new TransacoesFake(), relogio);
    await expect(uso.executar(HOLDER, 'moradia', 0)).rejects.toThrow('valorEmCentavos deve ser positivo');
  });
});