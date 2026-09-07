import type { ContaExterna, LancamentoExterno, TipoDeContaExterna } from '../../domain/model/conta-externa';
import { falha, ok, type MotivoDaFalha, type ResultadoDaAgregacao } from '../../domain/model/resultado-da-agregacao';
import type { AgregadorOpenFinance } from '../../domain/port/saida/agregador-open-finance';

// Adaptador do Pluggy Sandbox. Único lugar do sistema que conhece a forma da
// resposta do provedor: se ele renomear um campo, muda aqui e nada mais
// (RNF-020).
//
// Sem SDK — `fetch` nativo dá conta das duas chamadas desta história, e cada
// dependência a menos é uma superfície a menos para auditar (RNF-012).
//
// A credencial vem do ambiente e NUNCA do repositório. Sem ela o adaptador
// recusa operar, como o EmissorJwt de HN-001 e a cifra de HT-010: tentar
// anonimamente produziria um 401 confuso em vez de um erro de configuração.

const BASE_PADRAO = 'https://api.pluggy.ai';

export class CredencialDoAgregadorAusente extends Error {
  constructor() {
    super('PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET nao definidos: recusando falar com o agregador sem credencial.');
    this.name = 'CredencialDoAgregadorAusente';
  }
}

export interface ConfiguracaoDoPluggy {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly base?: string;
  /** Injetável para teste: nenhum teste desta história toca a rede. */
  readonly buscar?: typeof fetch;
  readonly limiteEmMs?: number;
}

export class AgregadorPluggy implements AgregadorOpenFinance {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly base: string;
  private readonly buscar: typeof fetch;
  private readonly limiteEmMs: number;
  private apiKey: string | null = null;

  constructor(config?: Partial<ConfiguracaoDoPluggy>) {
    const clientId = config?.clientId ?? process.env.PLUGGY_CLIENT_ID;
    const clientSecret = config?.clientSecret ?? process.env.PLUGGY_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new CredencialDoAgregadorAusente();

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.base = config?.base ?? BASE_PADRAO;
    this.buscar = config?.buscar ?? fetch;
    this.limiteEmMs = config?.limiteEmMs ?? 10_000;
  }

  async listarContas(idDaConexao: string): Promise<ResultadoDaAgregacao<readonly ContaExterna[]>> {
    const resposta = await this.pedir(`/accounts?itemId=${encodeURIComponent(idDaConexao)}`);
    if (resposta.tipo !== 'ok') return resposta;
    return ok(comoLista(resposta.dados).map(paraContaExterna));
  }

  async listarLancamentos(
    idDaConexao: string,
    desde: Date,
  ): Promise<ResultadoDaAgregacao<readonly LancamentoExterno[]>> {
    const rota = `/transactions?itemId=${encodeURIComponent(idDaConexao)}&from=${desde.toISOString().slice(0, 10)}`;
    const resposta = await this.pedir(rota);
    if (resposta.tipo !== 'ok') return resposta;
    return ok(comoLista(resposta.dados).map(paraLancamentoExterno));
  }

  /** Troca as credenciais por uma apiKey de curta duração. */
  private async autenticar(): Promise<ResultadoDaAgregacao<string>> {
    if (this.apiKey) return ok(this.apiKey);

    const resultado = await this.chamar('/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: this.clientId, clientSecret: this.clientSecret }),
    });
    if (resultado.tipo !== 'ok') return resultado;

    const apiKey = (resultado.dados as { apiKey?: unknown }).apiKey;
    if (typeof apiKey !== 'string') return falha('indisponivel', 'resposta de autenticacao sem apiKey');

    this.apiKey = apiKey;
    return ok(apiKey);
  }

  private async pedir(rota: string): Promise<ResultadoDaAgregacao<unknown>> {
    const autenticacao = await this.autenticar();
    if (autenticacao.tipo !== 'ok') return autenticacao;

    const resultado = await this.chamar(rota, { headers: { 'X-API-KEY': autenticacao.dados } });
    // apiKey expirada: descarta e deixa a nova tentativa do AgregadorResiliente
    // renovar. Não renovamos aqui para não duplicar a política de retry.
    if (resultado.tipo === 'falha' && resultado.motivo === 'credencial-invalida') this.apiKey = null;
    return resultado;
  }

  private async chamar(rota: string, opcoes: RequestInit): Promise<ResultadoDaAgregacao<unknown>> {
    try {
      const resposta = await this.buscar(this.base + rota, {
        ...opcoes,
        signal: AbortSignal.timeout(this.limiteEmMs),
      });

      if (!resposta.ok) {
        // A mensagem NUNCA carrega credencial nem corpo da resposta: um 401 do
        // provedor costuma ecoar o que foi enviado (RNF-015).
        return falha(motivoDoStatus(resposta.status), `provedor respondeu ${resposta.status}`);
      }
      return ok(await resposta.json());
    } catch (erro) {
      // Rede fora, DNS, timeout do AbortSignal: tudo transitório.
      const nome = erro instanceof Error ? erro.name : 'erro';
      return falha('indisponivel', `falha ao falar com o provedor (${nome})`);
    }
  }
}

/** 4xx é problema nosso e não melhora com repetição; 5xx é do provedor. */
function motivoDoStatus(status: number): MotivoDaFalha {
  if (status === 401 || status === 403) return 'credencial-invalida';
  if (status === 404) return 'nao-encontrado';
  if (status >= 400 && status < 500) return 'credencial-invalida';
  return 'indisponivel';
}

const comoLista = (dados: unknown): readonly Record<string, unknown>[] => {
  const resultados = (dados as { results?: unknown })?.results;
  return Array.isArray(resultados) ? resultados : [];
};

const emCentavos = (valor: unknown) => Math.round(Number(valor ?? 0) * 100);

function paraContaExterna(linha: Record<string, unknown>): ContaExterna {
  return {
    idExterno: String(linha.id ?? ''),
    instituicao: String((linha.institution as { name?: unknown })?.name ?? linha.name ?? 'Instituicao'),
    tipo: paraTipoDeConta(linha.type),
    saldoEmCentavos: emCentavos(linha.balance),
  };
}

function paraTipoDeConta(tipo: unknown): TipoDeContaExterna {
  const valor = String(tipo ?? '').toUpperCase();
  if (valor === 'CREDIT') return 'cartao-de-credito';
  if (valor === 'SAVINGS') return 'poupanca';
  return 'corrente';
}

function paraLancamentoExterno(linha: Record<string, unknown>): LancamentoExterno {
  return {
    idExterno: String(linha.id ?? ''),
    idDaContaExterna: String(linha.accountId ?? ''),
    descricaoOriginal: String(linha.description ?? ''),
    valorEmCentavos: emCentavos(linha.amount),
    dataDeCompetencia: new Date(String(linha.date ?? new Date().toISOString())),
  };
}
