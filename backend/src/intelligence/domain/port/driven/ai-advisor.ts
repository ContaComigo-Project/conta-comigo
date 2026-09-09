import type { Conselho, PedidoDeConselho } from '../../model/advice';
import type { ResultadoDeIa } from '../../model/ai-result';

// A porta (ADR-001). Trocar Gemini por outro provedor e trocar o adaptador;
// as politicas de teto, cache e espera sao decoradores desta mesma interface,
// e por isso valem para qualquer implementacao — inclusive a falsa.
export interface AiAdvisor {
  aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>>;
}
