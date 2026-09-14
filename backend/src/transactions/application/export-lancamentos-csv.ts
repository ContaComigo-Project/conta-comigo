import type { RepositorioDeTransactions } from '../../transactions/domain/port/driven/transaction-repository';
import type { HolderId } from '../../transactions/domain/model/holder';

// RF-024: exportar lançamentos em CSV. Separador `;` (padrão pt-BR), aspas
// escapadas e data ISO — importa em planilha sem quebra de coluna.
function celula(v: string): string {
  return `"${v.replaceAll('"', '""')}"`;
}

export class ExportarLancamentosCSV {
  constructor(private readonly transactions: RepositorioDeTransactions) {}

  async executar(holderId: string): Promise<string> {
    const lancamentos = await this.transactions.listarDoHolder(holderId as HolderId);
    const linhas = ['data;descricao;categoria;valorEmCentavos'];
    for (const l of lancamentos) {
      linhas.push(
        [l.dueDate.toISOString(), celula(l.readableDescription ?? l.description), celula(l.category ?? ''), String(l.amountInCents)].join(';'),
      );
    }
    return linhas.join('\r\n');
  }
}