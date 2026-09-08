import type { ConnectedBankDTO, SpendingCategoryDTO, TransactionDTO } from '@contacomigo/contrato';
import type { ConnectedBank } from '../mocks/connected-banks.mock';
import type { SpendingCategory } from '../mocks/spending-categories.mock';
import type { Transaction } from '../mocks/transactions.mock';
import { BANCOS, CATEGORIAS } from './presentation';

// Mapeadores: contrato -> forma que os componentes consomem HOJE. Toda decisao
// de apresentacao (moeda formatada, cor, icone, iniciais, rotulo relativo de
// tempo) acontece aqui, na borda — nunca no transporte (HT-016, RN-006).

const FUSO_SP = 'America/Sao_Paulo';
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** "8.500,00" — numero pt-BR com duas casas, sem simbolo (o sinal vem separado). */
export function numeroEmReais(centavos: number): string {
  return (Math.abs(centavos) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** "- R$ 34,90" / "+ R$ 8.500,00" — o formato que a lista exibe hoje. */
export function valorComSinal(centavos: number): string {
  return `${centavos < 0 ? '-' : '+'} R$ ${numeroEmReais(centavos)}`;
}

function partesEmSaoPaulo(instante: Date) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_SP, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(instante);
  const v = (t: string) => p.find((x) => x.type === t)?.value ?? '';
  return { year: Number(v('year')), month: Number(v('month')), dia: Number(v('day')), hora: v('hour').padStart(2, '0'), minuto: v('minute') };
}

/** "Hoje, 10:02" | "Ontem, 08:00" | "13 Jun, 18:45", no fuso de Sao Paulo. */
export function rotuloDeData(iso: string, agora: Date): string {
  const d = partesEmSaoPaulo(new Date(iso));
  const hoje = partesEmSaoPaulo(agora);
  const ontem = partesEmSaoPaulo(new Date(agora.getTime() - 24 * 60 * 60_000));
  const hora = `${d.hora}:${d.minuto}`;
  if (d.year === hoje.year && d.month === hoje.month && d.dia === hoje.dia) return `Hoje, ${hora}`;
  if (d.year === ontem.year && d.month === ontem.month && d.dia === ontem.dia) return `Ontem, ${hora}`;
  return `${d.dia} ${MESES[d.month - 1]}, ${hora}`;
}

/** "Agora mesmo" | "3 min atrás" | "Sincronizando..." */
export function rotuloDeSincronizacao(iso: string | null, status: ConnectedBankDTO['status'], agora: Date): string {
  if (status === 'sincronizando' || iso === null) return 'Sincronizando...';
  const minutos = Math.floor((agora.getTime() - new Date(iso).getTime()) / 60_000);
  return minutos < 1 ? 'Agora mesmo' : `${minutos} min atrás`;
}

export function paraTransactions(dados: TransactionDTO[], agora: Date): Transaction[] {
  return dados.map((l) => {
    const category = l.category ? CATEGORIAS[l.category.id] : CATEGORIAS.outros;
    const banco = BANCOS[l.instituicao.id];
    return {
      id: l.id,
      description: l.description,
      merchant: l.estabelecimento,
      category: l.category?.name ?? 'Outros',
      categoryIcon: category.iconeNaLista,
      bank: l.instituicao.name,
      bankColor: banco?.cor ?? '#94a3b8',
      amount: l.amountInCents / 100,
      type: l.tipo === 'debito' ? 'debit' : 'credit',
      formattedAmount: valorComSinal(l.amountInCents),
      date: new Date(l.dueDate),
      formattedDate: rotuloDeData(l.dueDate, agora),
    };
  });
}

export function paraConnectedBanks(dados: ConnectedBankDTO[], agora: Date): ConnectedBank[] {
  return dados.map((b) => {
    const visual = BANCOS[b.id];
    return {
      id: visual?.idLegado ?? b.id,
      name: b.name,
      color: visual?.cor ?? '#94a3b8',
      initials: visual?.iniciais ?? b.name.slice(0, 2).toUpperCase(),
      balance: b.saldoEmCents / 100,
      formattedBalance: `R$ ${numeroEmReais(b.saldoEmCents)}`,
      status: b.status === 'ativo' ? 'active' : b.status === 'sincronizando' ? 'syncing' : 'error',
      lastSync: rotuloDeSincronizacao(b.ultimaSincronizacao, b.status, agora),
    };
  });
}

export function paraSpendingCategories(dados: SpendingCategoryDTO[]): SpendingCategory[] {
  // Percentual derivado dos totais, com uma casa — o mesmo numero que o mock
  // trazia pronto, agora calculado em vez de digitado.
  const total = dados.reduce((s, c) => s + c.totalEmCents, 0);
  return dados.map((c) => {
    const visual = CATEGORIAS[c.category.id];
    return {
      id: visual?.idLegado ?? c.category.id,
      name: c.category.name,
      value: c.totalEmCents / 100,
      percentage: total === 0 ? 0 : Math.round((c.totalEmCents / total) * 1000) / 10,
      color: visual?.cor ?? '#94a3b8',
      icon: visual?.iconeNoGrafico ?? 'fa-ellipsis',
    };
  });
}
