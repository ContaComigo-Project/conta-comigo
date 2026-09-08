import { ok, type ConnectedBankDTO, type SpendingCategoryDTO, type TransactionDTO } from '@contacomigo/contract';
import { mockConnectedBanks } from '../mocks/connected-banks.mock';
import { mockSpendingCategories } from '../mocks/spending-categories.mock';
import { mockTransactions } from '../mocks/transactions.mock';
import { BANCOS, CATEGORIAS, idDaCategoriaPeloNome, idDoBancoPeloNome } from './presentation';
import type { DataSource } from './data-source';

// Origem falsa: entrega o CONTRATO a partir da massa que hoje vive em
// src/mocks. Usada por testes e pelo ambiente local ate a API real existir.
//
// Sobre datas: o mock traz `date` relativo a Date.now() E um rotulo literal
// ("Hoje, 10:02") que nao deriva dele — sao inconsistentes entre si. O rotulo e
// o que a tela mostra, entao ele e a fonte da massa: a origem falsa reconstroi
// o instante a partir do rotulo e do clock recebido, no fuso de Sao Paulo.

const FUSO_SP_EM_MINUTOS = -180; // Sao Paulo, sem horario de verao desde 2019
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function instanteEmSaoPaulo(year: number, monthIndex: number, dia: number, hora: number, minuto: number): Date {
  return new Date(Date.UTC(year, monthIndex, dia, hora, minuto) - FUSO_SP_EM_MINUTOS * 60_000);
}

function dataCivilEmSaoPaulo(instante: Date) {
  const local = new Date(instante.getTime() + FUSO_SP_EM_MINUTOS * 60_000);
  return { year: local.getUTCFullYear(), monthIndex: local.getUTCMonth(), dia: local.getUTCDate() };
}

/** "Hoje, 10:02" | "Ontem, 08:00" | "13 Jun, 18:45" -> instante ISO. */
function instanteDoRotulo(rotulo: string, agora: Date): string {
  const [parteDia, parteHora] = rotulo.split(', ');
  const [hora, minuto] = parteHora.split(':').map(Number);
  const hoje = dataCivilEmSaoPaulo(agora);

  if (parteDia === 'Hoje') return instanteEmSaoPaulo(hoje.year, hoje.monthIndex, hoje.dia, hora, minuto).toISOString();
  if (parteDia === 'Ontem') return instanteEmSaoPaulo(hoje.year, hoje.monthIndex, hoje.dia - 1, hora, minuto).toISOString();

  const [dia, month] = parteDia.split(' ');
  return instanteEmSaoPaulo(hoje.year, MESES.indexOf(month), Number(dia), hora, minuto).toISOString();
}

const centavos = (valor: number) => Math.round(valor * 100);

export class FakeSource implements DataSource {
  // Campo explicito: o tsconfig da web usa `erasableSyntaxOnly`, que proibe
  // parametro-propriedade no construtor.
  private readonly agora: Date;

  constructor(agora: Date = new Date()) {
    this.agora = agora;
  }

  async listarTransactions() {
    const dados: TransactionDTO[] = mockTransactions.map((t) => {
      const idCategoria = idDaCategoriaPeloNome(t.category);
      const idBanco = idDoBancoPeloNome(t.bank);
      return {
        id: t.id,
        description: t.description,
        estabelecimento: t.merchant,
        category: { id: idCategoria, name: CATEGORIAS[idCategoria].name },
        instituicao: { id: idBanco, name: BANCOS[idBanco]?.name ?? t.bank },
        amountInCents: centavos(t.amount),
        tipo: t.type === 'debit' ? 'debito' : 'credito',
        dueDate: instanteDoRotulo(t.formattedDate, this.agora),
      };
    });
    return ok(dados);
  }

  async listarBancosConectados() {
    // Rotulos relativos do mock -> instante: "Agora mesmo" = agora; "N min atras"
    // = agora - N min; "Sincronizando..." = ainda sem sincronizacao concluida.
    const dados: ConnectedBankDTO[] = mockConnectedBanks.map((b) => {
      const minutos = /^(\d+) min/.exec(b.lastSync)?.[1];
      const ultima =
        b.status === 'syncing' ? null
        : minutos ? new Date(this.agora.getTime() - Number(minutos) * 60_000).toISOString()
        : this.agora.toISOString();
      return {
        id: idDoBancoPeloNome(b.name),
        name: b.name,
        saldoEmCents: centavos(b.balance),
        status: b.status === 'active' ? 'ativo' : b.status === 'syncing' ? 'sincronizando' : 'error',
        ultimaSincronizacao: ultima,
      };
    });
    return ok(dados);
  }

  async listarCategoriasDeGasto() {
    // Percentual NAO vai no transporte: e derivado dos totais, na web.
    const dados: SpendingCategoryDTO[] = mockSpendingCategories.map((c) => {
      const id = idDaCategoriaPeloNome(c.name);
      return { category: { id, name: c.name }, totalEmCents: centavos(c.value) };
    });
    return ok(dados);
  }
}
