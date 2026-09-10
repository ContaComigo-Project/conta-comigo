import { describe, expect, it } from 'vitest';
import { holderId, type HolderId } from '../../transactions/domain/model/holder';
import type { Transaction } from '../../transactions/domain/model/transaction';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { AiAdvisor } from '../../intelligence/domain/port/driven/ai-advisor';
import { okDeIa, falhaDeIa, type ResultadoDeIa } from '../../intelligence/domain/model/ai-result';
import type { PedidoDeConselho, Conselho } from '../../intelligence/domain/model/advice';
import type { LimiteMensal } from '../domain/model/monthly-limit';
import type { BudgetAlert } from '../domain/model/budget-alert';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import { GetDiagnosisUseCase } from './get-diagnosis';

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

/** Captura o pedido para inspecionar o que foi enviado ao modelo (RN-019). */
class AdvisorFake implements AiAdvisor {
  ultimoPedido: PedidoDeConselho | null = null;
  resposta: ResultadoDeIa<Conselho> = okDeIa({ texto: 'Diagnóstico simulado: padrão dos meses anteriores.', origem: 'provedor' });
  async aconselhar(pedido: PedidoDeConselho) {
    this.ultimoPedido = pedido;
    return this.resposta;
  }
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

function casos(repo: RepoFake, txs: TransacoesFake, advisor: AdvisorFake) {
  return new GetDiagnosisUseCase(repo, txs, relogio(2026, 4), advisor);
}

describe('HN-009 — diagnóstico de saúde financeira (RF-018, RN-019, RN-020, RN-021)', () => {
  it('RN-020 — sem mês fechado com lançamentos, retorna dados-insuficientes', async () => {
    const advisor = new AdvisorFake();
    const uso = casos(new RepoFake(), new TransacoesFake(), advisor);
    const r = await uso.executar(HOLDER);
    expect(r).toEqual({ tipo: 'dados-insuficientes' });
  });

  it('RN-019 — o modelo recebe apenas números agregados, sem identidade', async () => {
    const repo = new RepoFake();
    repo.limites = [{ holderId: HOLDER, month: '2026-02', category: 'moradia', limitInCents: 10_000_00 }];
    const txs = new TransacoesFake();
    txs.itens = [transacao('moradia', -8_000_00, '2026-02')];
    const advisor = new AdvisorFake();
    const uso = casos(repo, txs, advisor);

    const r = await uso.executar(HOLDER);
    expect(r).toEqual({ tipo: 'ok', texto: 'Diagnóstico simulado: padrão dos meses anteriores.' });

    const pedido = advisor.ultimoPedido!;
    expect(pedido.tipo).toBe('diagnostico-do-mes');
    // Só números/categorias no payload: sem email, nome, id de conta ou CPF.
    const json = JSON.stringify(pedido.dados);
    expect(json).not.toContain('@');
    expect(json).not.toContain('holder');
    expect(json).not.toContain('cpf');
    const meses = pedido.dados.meses as Array<{ totalGastoEmCentavos: number; categoriasDeAtencao: Array<{ category: string; spentInCents: number; band: string }> }>;
    expect(meses[0].totalGastoEmCentavos).toBe(8_000_00);
    // moradia a 80% do limite é amarela → entra como atenção, só com números.
    expect(meses[0].categoriasDeAtencao[0]).toEqual({ category: 'moradia', spentInCents: 8_000_00, limitInCents: 10_000_00, band: 'amarela' });
  });

  it('RN-021 — provedor indisponível degrada em resultado estruturado, não em erro', async () => {
    const repo = new RepoFake();
    repo.limites = [{ holderId: HOLDER, month: '2026-02', category: 'moradia', limitInCents: 10_000_00 }];
    const txs = new TransacoesFake();
    txs.itens = [transacao('moradia', -8_000_00, '2026-02')];
    const advisor = new AdvisorFake();
    advisor.resposta = falhaDeIa('indisponivel', 'provedor fora');
    const uso = casos(repo, txs, advisor);

    const r = await uso.executar(HOLDER);
    expect(r).toEqual({ tipo: 'ia-indisponivel', motivo: 'provedor fora' });
  });

  it('RN-021 — teto diário degrada em estado próprio', async () => {
    const repo = new RepoFake();
    repo.limites = [{ holderId: HOLDER, month: '2026-02', category: 'moradia', limitInCents: 10_000_00 }];
    const txs = new TransacoesFake();
    txs.itens = [transacao('moradia', -8_000_00, '2026-02')];
    const advisor = new AdvisorFake();
    advisor.resposta = falhaDeIa('teto-atingido', 'teto diario atingido');
    const uso = casos(repo, txs, advisor);

    const r = await uso.executar(HOLDER);
    expect(r).toEqual({ tipo: 'teto-atingido' });
  });
});