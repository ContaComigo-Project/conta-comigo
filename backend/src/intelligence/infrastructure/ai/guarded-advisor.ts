import type { Conselho, PedidoDeConselho } from '../../domain/model/advice';
import { falhaDeIa, type ResultadoDeIa } from '../../domain/model/ai-result';
import { examinarSaida, type MotivoDoBloqueio } from '../../domain/model/output-guard';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';
import type { GuardLog } from '../../domain/port/driven/guard-log';

// RNF-017: a saida do modelo e entrada nao confiavel.
//
// Posicao na pilha: ABAIXO do cache. Assim, resposta reprovada nunca e
// guardada, e resposta guardada ja passou pelos tres exames — nao se valida o
// mesmo texto duas vezes.
//
// O bloqueio e falha tratada, com motivo proprio: a tela mostra o aviso e
// continua exibindo os numeros do consolidado (RN-021).

// O que a pessoa le. O texto reprovado NAO e repetido aqui — devolver "o modelo
// disse R$ 1.300,00, ignore" colocaria na tela exatamente o numero que RN-019
// manda esconder.
const EXPLICACAO: Record<MotivoDoBloqueio, string> = {
  'formato-invalido': 'A análise não pôde ser exibida porque a resposta veio em um formato inesperado.',
  'valor-divergente':
    'A análise não pôde ser exibida porque citou um valor que não confere com o seu painel. Os números do painel continuam válidos.',
  'recomendacao-de-produto':
    'A análise não pôde ser exibida: o ContaComigo não recomenda produtos financeiros, investimentos nem instituições.',
};

export class GuardedAdvisor implements AiAdvisor {
  constructor(
    private readonly interno: AiAdvisor,
    private readonly registro?: GuardLog,
  ) {}

  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    const resultado = await this.interno.aconselhar(pedido);
    // Falha do provedor atravessa com o motivo dela: "fora do ar" e "resposta
    // reprovada" pedem reacoes diferentes de quem opera.
    if (resultado.tipo === 'falha') return resultado;

    const veredito = examinarSaida(resultado.dados.texto, pedido.dados);
    if (veredito.aprovado) return resultado;

    // Quem opera precisa enxergar a reprovacao; a amostra curta basta para
    // diagnosticar sem despejar o texto inteiro no log (RNF-015).
    this.registro?.bloqueio(veredito.motivo, veredito.amostra);

    return falhaDeIa('resposta-bloqueada', EXPLICACAO[veredito.motivo]);
  }
}
