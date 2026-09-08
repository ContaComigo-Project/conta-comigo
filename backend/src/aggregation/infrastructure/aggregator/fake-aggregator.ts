import type { AccountExterna, TransactionExterno } from '../../domain/model/external-account';
import { falha, ok, type ResultDaAgregacao } from '../../domain/model/aggregation-result';
import type { ConexaoCriada, OpenFinanceAggregator } from '../../domain/port/driven/open-finance-aggregator';

// Adaptador falso (ADR-001: "todo adaptador externo nasce com uma implementacao
// falsa para teste"). Determinístico e sem rede: a mesma conexao devolve sempre
// o mesmo dado, entao teste e ambiente local nao dependem do Sandbox estar de pe
// nem de credencial existir.
//
// A massa e ficticia de proposito — instituicao inventada, nenhuma identity
// real. HT-016 encontrou identity pessoal real nos mocks da web e isso nao se
// repete aqui.

const CONEXAO_CONHECIDA = 'conexao-1';

const CONTAS: readonly AccountExterna[] = [
  { idExterno: 'account-corrente-1', instituicao: 'Banco Exemplo', tipo: 'corrente', saldoEmCentavos: 241_832 },
  { idExterno: 'account-poupanca-1', instituicao: 'Banco Exemplo', tipo: 'poupanca', saldoEmCentavos: 1_084_213 },
  // RN-009: cartao entra como fatura, nunca somado ao saldo. Saldo negativo
  // representa a fatura em aberto.
  { idExterno: 'cartao-1', instituicao: 'Banco Exemplo', tipo: 'cartao-de-credito', saldoEmCentavos: -87_450 },
];

const LANCAMENTOS: readonly TransactionExterno[] = [
  { idExterno: 'lanc-1', idDaAccountExterna: 'account-corrente-1', descriptionOriginal: 'PAG*MERCADO CENTRAL', amountInCents: -21_850, dueDate: new Date('2026-01-15T14:30:00Z') },
  { idExterno: 'lanc-2', idDaAccountExterna: 'account-corrente-1', descriptionOriginal: 'TRANSF RECEBIDA', amountInCents: 850_000, dueDate: new Date('2026-01-20T09:00:00Z') },
  { idExterno: 'lanc-3', idDaAccountExterna: 'cartao-1', descriptionOriginal: 'UBER *TRIP HELP.UBER', amountInCents: -3_490, dueDate: new Date('2026-02-05T18:12:00Z') },
  { idExterno: 'lanc-4', idDaAccountExterna: 'cartao-1', descriptionOriginal: 'NETFLIX.COM', amountInCents: -5_590, dueDate: new Date('2026-02-10T03:00:00Z') },
  { idExterno: 'lanc-5', idDaAccountExterna: 'account-poupanca-1', descriptionOriginal: 'RENDIMENTO', amountInCents: 3_870, dueDate: new Date('2026-02-28T23:59:00Z') },
];

export class FakeAggregator implements OpenFinanceAggregator {
  async criarConexao(instituicaoId: string): Promise<ResultDaAgregacao<ConexaoCriada>> {
    // Sintético e determinístico: a mesma instituicao devolve a mesma conexao,
    // para que ambiente local e testes nao dependam do Sandbox.
    return ok({ connectionId: CONEXAO_CONHECIDA, token: `token-sintetico-${instituicaoId}` });
  }

  async listarAccounts(idDaConexao: string): Promise<ResultDaAgregacao<readonly AccountExterna[]>> {
    // Conexao inexistente nao e lista vazia: confundir as duas esconde error de
    // configuracao atras de uma tela que apenas parece sem movimento.
    if (idDaConexao !== CONEXAO_CONHECIDA) return falha('nao-encontrado', 'conexao desconhecida');
    return ok(CONTAS);
  }

  async listarTransactions(
    idDaConexao: string,
    desde: Date,
  ): Promise<ResultDaAgregacao<readonly TransactionExterno[]>> {
    if (idDaConexao !== CONEXAO_CONHECIDA) return falha('nao-encontrado', 'conexao desconhecida');
    return ok(LANCAMENTOS.filter((l) => l.dueDate.getTime() >= desde.getTime()));
  }
}
