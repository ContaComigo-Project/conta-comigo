import type { Conselho, PedidoDeConselho } from '../../domain/model/advice';
import { falhaDeIa, okDeIa, type ResultadoDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';

// Adaptador do Gemini. Único lugar do sistema que conhece a forma da requisição
// e da resposta do provedor: se o formato mudar, muda aqui e nada mais
// (RNF-020).
//
// Sem SDK e sem LangChain (ADR-006): é uma chamada HTTP, e cada dependência a
// menos é uma superfície a menos para auditar (RNF-012).
//
// A chave vem do ambiente e NUNCA do repositório. Sem ela o adaptador recusa
// operar, como o JwtIssuer de HN-001 e o PluggyAggregator de HT-011.

const BASE_PADRAO = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODELO_PADRAO = 'gemini-2.0-flash';

export class ChaveDeIaAusente extends Error {
  constructor() {
    super('GEMINI_API_KEY nao definida: recusando falar com o provedor de IA sem credencial.');
    this.name = 'ChaveDeIaAusente';
  }
}

export interface ConfiguracaoDoGemini {
  readonly apiKey: string;
  readonly modelo?: string;
  readonly base?: string;
  /** Injetável para teste: nenhum teste desta história toca a rede. */
  readonly buscar?: typeof fetch;
  readonly limiteEmMs?: number;
}

// O prompt recebe a pergunta e os números — nunca o titular (RNF-015). Quem é a
// pessoa não muda a resposta e não tem por que sair do sistema.
function montarPrompt(pedido: PedidoDeConselho): string {
  return [
    'Você é um assistente educativo de finanças pessoais.',
    'Interprete apenas os números fornecidos; não invente valores.',
    'Não recomende produto financeiro, investimento, crédito nem instituição.',
    `Tarefa: ${pedido.tipo}`,
    `Pergunta: ${pedido.pergunta}`,
    `Dados: ${JSON.stringify(pedido.dados)}`,
  ].join('\n');
}

export class GeminiAdvisor implements AiAdvisor {
  private readonly apiKey: string;
  private readonly modelo: string;
  private readonly base: string;
  private readonly buscar: typeof fetch;
  private readonly limiteEmMs: number;

  constructor(configuracao: ConfiguracaoDoGemini) {
    if (!configuracao.apiKey) throw new ChaveDeIaAusente();

    this.apiKey = configuracao.apiKey;
    this.modelo = configuracao.modelo ?? MODELO_PADRAO;
    this.base = configuracao.base ?? BASE_PADRAO;
    this.buscar = configuracao.buscar ?? fetch;
    this.limiteEmMs = configuracao.limiteEmMs ?? 10_000;
  }

  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    const controle = new AbortController();
    const expirar = setTimeout(() => controle.abort(), this.limiteEmMs);

    try {
      const resposta = await this.buscar(`${this.base}/${this.modelo}:generateContent`, {
        method: 'POST',
        // A chave vai no cabeçalho, não na query: URL vaza em log de proxy e em
        // histórico de terminal (RNF-012).
        headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: montarPrompt(pedido) }] }] }),
        signal: controle.signal,
      });

      if (!resposta.ok) return this.falhaDeStatus(resposta.status);

      const corpo = (await resposta.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const texto = corpo.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // Resposta vazia não é conselho: devolver string vazia empurraria o
      // problema para a tela, que mostraria um bloco de IA em branco.
      if (!texto) return falhaDeIa('resposta-invalida', 'provedor respondeu sem texto utilizável');

      return okDeIa({ texto, origem: 'provedor' });
    } catch (erro) {
      return falhaDeIa('indisponivel', erro instanceof Error ? erro.message : 'falha desconhecida no provedor');
    } finally {
      clearTimeout(expirar);
    }
  }

  // 401/403 é chave errada ou sem permissão: insistir não conserta. 429 é cota
  // do provedor — transitória do ponto de vista do dia seguinte, mas repetir
  // agora só piora, então também não vale nova tentativa.
  private falhaDeStatus(status: number) {
    if (status === 401 || status === 403 || status === 429) {
      return falhaDeIa('credencial-invalida', `provedor recusou a chamada (HTTP ${status})`);
    }
    return falhaDeIa('indisponivel', `provedor respondeu HTTP ${status}`);
  }
}
