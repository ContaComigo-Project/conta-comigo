import { describe, expect, it } from 'vitest';
import { holderId, type HolderId } from '../../transactions/domain/model/holder';
import type { Transaction } from '../../transactions/domain/model/transaction';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { AiAdvisor } from '../domain/port/driven/ai-advisor';
import { okDeIa, falhaDeIa, type ResultadoDeIa } from '../domain/model/ai-result';
import type { PedidoDeConselho, Conselho } from '../domain/model/advice';
import { AVISO_DE_NAO_ACONSELHAMENTO, PerguntarNoChatUseCase } from './chat';

const HOLDER = holderId('holder-a');

class TransacoesFake implements RepositorioDeTransactions {
  itens: Transaction[] = [];
  async listarDoHolder(h: HolderId) { return this.itens.filter((t) => t.holderId === h); }
  async buscarDoHolder(h: HolderId, id: string) { return this.itens.find((t) => t.holderId === h && t.id === id) ?? null; }
  async salvar() {}
  async salvarSincronizados() {}
  async deleteByHolder() {}
}

class AdvisorFake implements AiAdvisor {
  ultimoPedido: PedidoDeConselho | null = null;
  resposta: ResultadoDeIa<Conselho> = okDeIa({ texto: 'Resposta simulada e educativa.', origem: 'provedor' });
  async aconselhar(pedido: PedidoDeConselho) {
    this.ultimoPedido = pedido;
    return this.resposta;
  }
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
    dueDate: new Date(Date.UTC(2026, 7, 10, 12)),
    externalId: null,
  };
}

describe('HN-010 — chat educativo (RF-020, RF-021/RN-018, RN-021)', () => {
  it('RF-020/RN-019 — a resposta usa o gasto da pessoa; o modelo recebe só números', async () => {
    const txs = new TransacoesFake();
    txs.itens = [transacao('moradia', 8_000_00), transacao('lazer', 3_000_00)];
    const advisor = new AdvisorFake();
    const uso = new PerguntarNoChatUseCase(txs, relogio, advisor);

    const r = await uso.executar(HOLDER, 'Onde estou gastando mais?');

    expect(r.tipo).toBe('ok');
    const resumo = advisor.ultimoPedido!.dados.resumoDoGasto as Array<{ categoria: string; totalEmCentavos: number }>;
    expect(resumo).toEqual([
      { categoria: 'moradia', totalEmCentavos: 8_000_00 },
      { categoria: 'lazer', totalEmCentavos: 3_000_00 },
    ]);
    const json = JSON.stringify(advisor.ultimoPedido!.dados);
    expect(json).not.toContain('@');
    expect(json).not.toContain('holder');
  });

  it('RN-018 — toda resposta ok carrega o aviso de não aconselhamento', async () => {
    const advisor = new AdvisorFake();
    const uso = new PerguntarNoChatUseCase(new TransacoesFake(), relogio, advisor);

    const r = await uso.executar(HOLDER, 'Devo investir?');

    expect(r.tipo).toBe('ok');
    if (r.tipo === 'ok') {
      expect(r.aviso).toBe(AVISO_DE_NAO_ACONSELHAMENTO);
      expect(r.aviso).toContain('não é aconselhamento financeiro');
    }
  });

  it('RN-021 — provedor indisponível degrada em estado estruturado', async () => {
    const advisor = new AdvisorFake();
    advisor.resposta = falhaDeIa('indisponivel', 'provedor fora');
    const uso = new PerguntarNoChatUseCase(new TransacoesFake(), relogio, advisor);

    const r = await uso.executar(HOLDER, 'Oi');

    expect(r).toEqual({ tipo: 'ia-indisponivel', motivo: 'provedor fora' });
  });

  it('RN-017 — recomendação de produto bloqueada pela guarda degrada com estado próprio', async () => {
    const advisor = new AdvisorFake();
    advisor.resposta = falhaDeIa('resposta-bloqueada', 'recomendacao-de-produto');
    const uso = new PerguntarNoChatUseCase(new TransacoesFake(), relogio, advisor);

    const r = await uso.executar(HOLDER, 'Qual o melhor investimento?');

    expect(r).toEqual({ tipo: 'ia-bloqueou', motivo: 'recomendacao-de-produto' });
  });
});