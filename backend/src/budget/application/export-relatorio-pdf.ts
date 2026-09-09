import PDFDocument from 'pdfkit';
import { mesDeReferencia } from '../../transactions/domain/reference-month';
import type { Clock } from '../../transactions/domain/port/driven/clock';
import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';
import type { BudgetRepository } from '../domain/port/driven/budget-repository';
import { categoriasDoMes } from './por-categoria-do-mes';

const MESES_NO_RELATORIO = 6;

// RF-023: relatório do histórico em PDF com os MESMOS números do painel
// (RN-019). Os valores vêm do consolidado; nenhum é citado pelo modelo.
export class ExportarRelatorioPDF {
  constructor(
    private readonly repo: BudgetRepository,
    private readonly transactions: RepositorioDeTransactions,
    private readonly clock: Clock,
  ) {}

  async executar(holderId: string, month?: string): Promise<Buffer> {
    const corrente = mesDeReferencia(this.clock.agora());
    const transacoes = await this.transactions.listarDoHolder(holderId as HolderId);

    const meses: Array<{ month: string; linhas: string[] }> = [];
    const alvos = month ? [month] : Array.from({ length: MESES_NO_RELATORIO }, (_, i) => {
      const d = new Date(Date.UTC(corrente.ano, corrente.mes - 1 - 1 - i, 1));
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    });
    for (const alvo of alvos) {
      const monthAtual = alvo;
      const limites = await this.repo.listarDoMes(holderId, monthAtual);
      const categorias = await categoriasDoMes(limites, transacoes, monthAtual);
      if (categorias.length === 0) continue;
      meses.push({
        month: monthAtual,
        linhas: categorias.map((c) => {
          const limite = c.limitInCents === null ? 'sem limite' : `R$ ${(c.limitInCents / 100).toFixed(2)}`;
          const faixa = c.band === 'sem-limite' ? 'sem faixa' : c.band;
          return `${c.category} | gasto R$ ${(c.spentInCents / 100).toFixed(2)} | limite ${limite} | faixa ${faixa}`;
        }),
      });
    }

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const pronto = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(16).text('ContaComigo - Relatório de orçamento', { align: 'center' });
    doc.moveDown();
    for (const m of meses) {
      doc.fontSize(12).text(m.month);
      doc.moveDown(0.3);
      for (const linha of m.linhas) doc.fontSize(9).text(linha);
      doc.moveDown();
    }
    doc.end();

    return pronto;
  }
}