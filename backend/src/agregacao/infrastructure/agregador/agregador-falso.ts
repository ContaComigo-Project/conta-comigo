import type { ContaExterna, LancamentoExterno } from '../../domain/model/conta-externa';
import { falha, ok, type ResultadoDaAgregacao } from '../../domain/model/resultado-da-agregacao';
import type { AgregadorOpenFinance } from '../../domain/port/saida/agregador-open-finance';

// Adaptador falso (ADR-001: "todo adaptador externo nasce com uma implementacao
// falsa para teste"). Determinístico e sem rede: a mesma conexao devolve sempre
// o mesmo dado, entao teste e ambiente local nao dependem do Sandbox estar de pe
// nem de credencial existir.
//
// A massa e ficticia de proposito — instituicao inventada, nenhuma identidade
// real. HT-016 encontrou identidade pessoal real nos mocks da web e isso nao se
// repete aqui.

const CONEXAO_CONHECIDA = 'conexao-1';

const CONTAS: readonly ContaExterna[] = [
  { idExterno: 'conta-corrente-1', instituicao: 'Banco Exemplo', tipo: 'corrente', saldoEmCentavos: 241_832 },
  { idExterno: 'conta-poupanca-1', instituicao: 'Banco Exemplo', tipo: 'poupanca', saldoEmCentavos: 1_084_213 },
  // RN-009: cartao entra como fatura, nunca somado ao saldo. Saldo negativo
  // representa a fatura em aberto.
  { idExterno: 'cartao-1', instituicao: 'Banco Exemplo', tipo: 'cartao-de-credito', saldoEmCentavos: -87_450 },
];

const LANCAMENTOS: readonly LancamentoExterno[] = [
  { idExterno: 'lanc-1', idDaContaExterna: 'conta-corrente-1', descricaoOriginal: 'PAG*MERCADO CENTRAL', valorEmCentavos: -21_850, dataDeCompetencia: new Date('2026-01-15T14:30:00Z') },
  { idExterno: 'lanc-2', idDaContaExterna: 'conta-corrente-1', descricaoOriginal: 'TRANSF RECEBIDA', valorEmCentavos: 850_000, dataDeCompetencia: new Date('2026-01-20T09:00:00Z') },
  { idExterno: 'lanc-3', idDaContaExterna: 'cartao-1', descricaoOriginal: 'UBER *TRIP HELP.UBER', valorEmCentavos: -3_490, dataDeCompetencia: new Date('2026-02-05T18:12:00Z') },
  { idExterno: 'lanc-4', idDaContaExterna: 'cartao-1', descricaoOriginal: 'NETFLIX.COM', valorEmCentavos: -5_590, dataDeCompetencia: new Date('2026-02-10T03:00:00Z') },
  { idExterno: 'lanc-5', idDaContaExterna: 'conta-poupanca-1', descricaoOriginal: 'RENDIMENTO', valorEmCentavos: 3_870, dataDeCompetencia: new Date('2026-02-28T23:59:00Z') },
];

export class AgregadorFalso implements AgregadorOpenFinance {
  async listarContas(idDaConexao: string): Promise<ResultadoDaAgregacao<readonly ContaExterna[]>> {
    // Conexao inexistente nao e lista vazia: confundir as duas esconde erro de
    // configuracao atras de uma tela que apenas parece sem movimento.
    if (idDaConexao !== CONEXAO_CONHECIDA) return falha('nao-encontrado', 'conexao desconhecida');
    return ok(CONTAS);
  }

  async listarLancamentos(
    idDaConexao: string,
    desde: Date,
  ): Promise<ResultadoDaAgregacao<readonly LancamentoExterno[]>> {
    if (idDaConexao !== CONEXAO_CONHECIDA) return falha('nao-encontrado', 'conexao desconhecida');
    return ok(LANCAMENTOS.filter((l) => l.dataDeCompetencia.getTime() >= desde.getTime()));
  }
}
