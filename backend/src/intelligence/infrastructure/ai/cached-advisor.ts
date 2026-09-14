import type { Conselho, PedidoDeConselho } from '../../domain/model/advice';
import { chaveDoConselho } from '../../domain/model/advice-key';
import { okDeIa, type ResultadoDeIa } from '../../domain/model/ai-result';
import type { AdviceCache } from '../../domain/port/driven/advice-cache';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';

// RNF-010 como decorador da porta: vale para o Gemini, para o falso e para
// qualquer provedor futuro.
//
// Falha NAO entra no cache. Guardar "o provedor estava fora" transformaria uma
// indisponibilidade de dez segundos em uma resposta ruim permanente.
export class CachedAdvisor implements AiAdvisor {
  constructor(
    private readonly interno: AiAdvisor,
    private readonly cache: AdviceCache,
  ) {}

  async aconselhar(pedido: PedidoDeConselho): Promise<ResultadoDeIa<Conselho>> {
    const chave = chaveDoConselho(pedido);

    const guardado = await this.cache.buscar(chave);
    if (guardado) return okDeIa({ ...guardado, origem: 'cache' });

    const resultado = await this.interno.aconselhar(pedido);
    // Contingência (provedor fora) NÃO entra no cache: é uma indisponibilidade
    // momentânea, e cacheá-la faria o texto simulado voltar como se fosse real.
    if (resultado.tipo === 'ok' && resultado.dados.origem !== 'contingencia') {
      await this.cache.guardar(chave, resultado.dados);
    }

    return resultado;
  }
}
