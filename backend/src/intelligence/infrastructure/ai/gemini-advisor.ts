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
const MODELO_PADRAO = 'gemini-3.5-flash';
const MODELOS_CANDIDATOS = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.7-flash'];

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
    'Você é um assistente educativo de finanças pessoais do aplicativo ContaComigo.',
    'Interprete com clareza a dúvida do usuário com base nos dados reais fornecidos.',
    'NÃO invente valores monetários, nem cite valores fictícios em R$ que não estejam nos Dados.',
    'Ao citar valores, use EXCLUSIVAMENTE o formato "R$ X.XXX,XX" ou "R$ XX,XX". NUNCA escreva números seguidos da palavra centavos (ex: não escreva "150.000 centavos").',
    'NÃO recomende produtos financeiros específicos (como CDB, LCI, ações, cripto, empréstimos), investimentos nem instituições bancárias.',
    'Seja educativo, encorajador e objetivo, apresentando boas práticas de organização financeira e hábitos saudáveis.',
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
    this.modelo = configuracao.modelo ?? process.env.GEMINI_MODEL ?? MODELO_PADRAO;
    this.base = configuracao.base ?? BASE_PADRAO;
    this.buscar = configuracao.buscar ?? fetch;
    this.limiteEmMs = configuracao.limiteEmMs ?? 10_000;
  }

  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    const controle = new AbortController();
    const expirar = setTimeout(() => controle.abort(), this.limiteEmMs);

    // Lista de modelos a tentar em cascata caso o modelo padrão atinja cota (429) ou indisponibilidade (503/404)
    const modelosParaTentar = [this.modelo, ...MODELOS_CANDIDATOS.filter((m) => m !== this.modelo)];

    try {
      let ultimoStatus = 500;

      for (const modelo of modelosParaTentar) {
        try {
          const resposta = await this.buscar(`${this.base}/${modelo}:generateContent`, {
            method: 'POST',
            // A chave vai no cabeçalho, não na query: URL vaza em log de proxy e em
            // histórico de terminal (RNF-012).
            headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
            body: JSON.stringify({ contents: [{ parts: [{ text: montarPrompt(pedido) }] }] }),
            signal: controle.signal,
          });

          if (!resposta.ok) {
            ultimoStatus = resposta.status;
            // Se for cota esgotada (429), indisponibilidade (503) ou modelo não encontrado (404),
            // tenta o próximo modelo candidato da lista antes de falhar
            if ((resposta.status === 429 || resposta.status === 503 || resposta.status === 404) && modelo !== modelosParaTentar[modelosParaTentar.length - 1]) {
              continue;
            }
            return this.falhaDeStatus(resposta.status);
          }

          const corpo = (await resposta.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const texto = corpo.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          // Resposta vazia não é conselho: devolver string vazia empurraria o
          // problema para a tela, que mostraria um bloco de IA em branco.
          if (!texto) return falhaDeIa('resposta-invalida', 'provedor respondeu sem texto utilizável');

          return okDeIa({ texto, origem: 'provedor' });
        } catch (erro) {
          if (erro instanceof Error && erro.name === 'AbortError') {
            return falhaDeIa('indisponivel', 'tempo limite excedido ao comunicar com o provedor de IA');
          }
          // Em erro de rede pontual, se ainda houver modelos candidatos, continua
          if (modelo === modelosParaTentar[modelosParaTentar.length - 1]) {
            return falhaDeIa('indisponivel', erro instanceof Error ? erro.message : 'falha desconhecida no provedor');
          }
        }
      }

      return this.falhaDeStatus(ultimoStatus);
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
