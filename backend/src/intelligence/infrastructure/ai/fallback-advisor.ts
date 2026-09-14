import type { Conselho, PedidoDeConselho } from '../../domain/model/advice';
import type { ResultadoDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';

/**
 * FallbackAdvisor: delega a consulta de IA ao provedor principal (ex: Gemini)
 * e, caso este falhe (por cota esgotada 429, indisponibilidade 503 ou erro de rede),
 * aciona o provedor de contingência (FakeAdvisor) para garantir continuidade ao usuário.
 */
export class FallbackAdvisor implements AiAdvisor {
  constructor(
    private readonly principal: AiAdvisor,
    private readonly reserva: AiAdvisor,
  ) {}

  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    const resultado = await this.principal.aconselhar(pedido);
    if (resultado.tipo === 'ok') return resultado;

    const reserva = await this.reserva.aconselhar(pedido);
    if (reserva.tipo === 'ok') {
      // A contingência NÃO é silenciosa: a tela sabe que o provedor falhou e por
      // quê (credencial, alta demanda, fora do ar), em vez de fingir que é real.
      return { tipo: 'ok', dados: { texto: reserva.dados.texto, origem: 'contingencia', falhaDetalhe: resultado.detalhe } };
    }
    return reserva;
  }
}
