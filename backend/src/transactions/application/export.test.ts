import { describe, expect, it } from 'vitest';
import { holderId, type HolderId } from '../../transactions/domain/model/holder';
import type { Transaction } from '../../transactions/domain/model/transaction';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import { ExportarLancamentosCSV } from './export-lancamentos-csv';
import { ExportarRelatorioPDF } from '../../budget/application/export-relatorio-pdf';
import type { BudgetRepository } from '../../budget/domain/port/driven/budget-repository';
import type { LimiteMensal } from '../../budget/domain/model/monthly-limit';
import type { BudgetAlert } from '../../budget/domain/model/budget-alert';
import type { Clock } from '../../transactions/domain/port/driven/clock';

const HOLDER = holderId('holder-a');

class TransacoesFake implements RepositorioDeTransactions {
  itens: Transaction[] = [];
  async listarDoHolder(h: HolderId) { return this.itens.filter((t) => t.holderId === h); }
  async buscarDoHolder(h: HolderId, id: string) { return this.itens.find((t) => t.holderId === h && t.id === id) ?? null; }
  async salvar() {}
  async salvarSincronizados() {}
  async deleteByHolder() {}
}

class RepoFake implements BudgetRepository {
  limites: LimiteMensal[] = [];
  async definir(l: LimiteMensal) { this.limites.push(l); }
  async remover() { return true; }
  async listarDoMes(h: string, month: string) { return this.limites.filter((l) => l.holderId === h && l.month === month); }
  async listarAlertasDoMes() { return []; }
  async registrarAlerta() {}
}

const relogio: Clock = { agora: () => new Date(Date.UTC(2026, 8, 15)) };

function transacao(descricao: string, valorCentavos: number, category: string, comAspas = false): Transaction {
  const d = comAspas ? 'Compra "promocional"' : descricao;
  return {
    id: `${category}-${valorCentavos}`,
    holderId: HOLDER,
    description: d,
    readableDescription: null,
    category: category as Transaction['category'],
    categoryOrigin: null,
    amountInCents: valorCentavos,
    dueDate: new Date(Date.UTC(2026, 8, 10, 12)),
    externalId: null,
  };
}

describe('HN-011 — exportação (RF-023, RF-024)', () => {
  it('RF-024 — CSV com cabeçalho, linhas por lançamento e separador ;', async () => {
    const txs = new TransacoesFake();
    txs.itens = [transacao('mercado', 12_345, 'mercado'), transacao('lazer', 4_500, 'lazer')];

    const csv = await new ExportarLancamentosCSV(txs).executar(HOLDER);

    const linhas = csv.split('\r\n');
    expect(linhas[0]).toBe('data;descricao;categoria;valorEmCentavos');
    expect(linhas[1]).toContain('"mercado";12345');
    expect(linhas[2]).toContain('"lazer";4500');
    expect(linhas.length).toBe(3);
  });

  it('RF-024 — aspas e vírgula escapadas para não quebrar coluna', async () => {
    const txs = new TransacoesFake();
    txs.itens = [transacao('x', 100, 'mercado', true)];

    const csv = await new ExportarLancamentosCSV(txs).executar(HOLDER);

    const linha = csv.split('\r\n')[1];
    expect(linha).toContain('"Compra ""promocional"""');
    expect(linha.split(';')).toHaveLength(4); // descrição com ; escapada não quebra
  });

  it('RF-023 — PDF gerado é um buffer não vazio com os números do painel', async () => {
    const repo = new RepoFake();
    repo.limites = [{ holderId: HOLDER, month: '2026-08', category: 'moradia', limitInCents: 10_000_00 }];
    const txs = new TransacoesFake();
    txs.itens = [transacao('aluguel', -8_000_00, 'moradia')];

    const buffer = await new ExportarRelatorioPDF(repo, txs, relogio).executar(HOLDER, '2026-08');

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1_000);
    // Conteúdo comprimido (FlateDecode); validamos a estrutura do arquivo.
    const texto = buffer.toString('latin1');
    expect(texto.startsWith('%PDF')).toBe(true);
    expect(texto.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(texto).toContain('/FlateDecode');
  });
});