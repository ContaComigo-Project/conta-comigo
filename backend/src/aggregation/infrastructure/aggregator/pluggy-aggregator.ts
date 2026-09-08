import type { AccountExterna, TransactionExterno, TipoDeAccountExterna } from '../../domain/model/external-account';
import { falha, ok, type MotivoDaFalha, type ResultDaAgregacao } from '../../domain/model/aggregation-result';
import type { OpenFinanceAggregator } from '../../domain/port/driven/open-finance-aggregator';

// Adaptador do Pluggy Sandbox. Único lugar do sistema que conhece a forma da
// response do provedor: se ele renomear um campo, muda aqui e nada mais
// (RNF-020).
//
// Sem SDK — `fetch` nativo dá account das duas chamadas desta história, e cada
// dependência a menos é uma superfície a menos para auditar (RNF-012).
//
// A credencial vem do ambiente e NUNCA do repositório. Sem ela o adaptador
// recusa operar, como o JwtIssuer de HN-001 e a cipher de HT-010: tentar
// anonimamente produziria um 401 confuso em vez de um error de configuração.

const BASE_PADRAO = 'https://api.pluggy.ai';

export class CredencialDoAgregadorAusente extends Error {
  constructor() {
    super('PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET nao definidos: recusando falar com o aggregator sem credencial.');
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

export class PluggyAggregator implements OpenFinanceAggregator {
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

  async listarAccounts(idDaConexao: string): Promise<ResultDaAgregacao<readonly AccountExterna[]>> {
    const response = await this.pedir(`/accounts?itemId=${encodeURIComponent(idDaConexao)}`);
    if (response.tipo !== 'ok') return response;
    return ok(comoLista(response.dados).map(paraAccountExterna));
  }

  async listarTransactions(
    idDaConexao: string,
    desde: Date,
  ): Promise<ResultDaAgregacao<readonly TransactionExterno[]>> {
    const route = `/transactions?itemId=${encodeURIComponent(idDaConexao)}&from=${desde.toISOString().slice(0, 10)}`;
    const response = await this.pedir(route);
    if (response.tipo !== 'ok') return response;
    return ok(comoLista(response.dados).map(paraTransactionExterno));
  }

  /** Troca as credenciais por uma apiKey de curta duração. */
  private async authenticate(): Promise<ResultDaAgregacao<string>> {
    if (this.apiKey) return ok(this.apiKey);

    const resultado = await this.chamar('/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ clientId: this.clientId, clientSecret: this.clientSecret }),
    });
    if (resultado.tipo !== 'ok') return resultado;

    const apiKey = (resultado.dados as { apiKey?: unknown }).apiKey;
    if (typeof apiKey !== 'string') return falha('indisponivel', 'response de autenticacao sem apiKey');

    this.apiKey = apiKey;
    return ok(apiKey);
  }

  private async pedir(route: string): Promise<ResultDaAgregacao<unknown>> {
    const autenticacao = await this.authenticate();
    if (autenticacao.tipo !== 'ok') return autenticacao;

    const resultado = await this.chamar(route, { headers: { 'X-API-KEY': autenticacao.dados } });
    // apiKey expirada: descarta e deixa a nova tentativa do ResilientAggregator
    // renovar. Não renovamos aqui para não duplicar a política de retry.
    if (resultado.tipo === 'falha' && resultado.motivo === 'credencial-invalida') this.apiKey = null;
    return resultado;
  }

  private async chamar(route: string, opcoes: RequestInit): Promise<ResultDaAgregacao<unknown>> {
    try {
      const response = await this.buscar(this.base + route, {
        ...opcoes,
        signal: AbortSignal.timeout(this.limiteEmMs),
      });

      if (!response.ok) {
        // A mensagem NUNCA carrega credencial nem body da response: um 401 do
        // provedor costuma ecoar o que foi enviado (RNF-015).
        return falha(motivoDoStatus(response.status), `provedor respondeu ${response.status}`);
      }
      return ok(await response.json());
    } catch (error) {
      // Rede fora, DNS, timeout do AbortSignal: tudo transitório.
      const nome = error instanceof Error ? error.name : 'error';
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

function paraAccountExterna(linha: Record<string, unknown>): AccountExterna {
  return {
    idExterno: String(linha.id ?? ''),
    instituicao: String((linha.institution as { name?: unknown })?.name ?? linha.name ?? 'Instituicao'),
    tipo: paraTipoDeAccount(linha.type),
    saldoEmCentavos: emCentavos(linha.balance),
  };
}

function paraTipoDeAccount(tipo: unknown): TipoDeAccountExterna {
  const valor = String(tipo ?? '').toUpperCase();
  if (valor === 'CREDIT') return 'cartao-de-credito';
  if (valor === 'SAVINGS') return 'poupanca';
  return 'corrente';
}

function paraTransactionExterno(linha: Record<string, unknown>): TransactionExterno {
  return {
    idExterno: String(linha.id ?? ''),
    idDaAccountExterna: String(linha.accountId ?? ''),
    descriptionOriginal: String(linha.description ?? ''),
    amountInCents: emCentavos(linha.amount),
    dueDate: new Date(String(linha.date ?? new Date().toISOString())),
  };
}
