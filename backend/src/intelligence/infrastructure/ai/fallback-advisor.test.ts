import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from '../../domain/model/advice';
import { falhaDeIa, okDeIa, type ResultadoDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';
import { FallbackAdvisor } from './fallback-advisor';

const pedido: PedidoDeConselho = {
  holder: 'holder-1',
  tipo: 'pergunta-livre',
  pergunta: 'Como economizar?',
  dados: {},
};

describe('FallbackAdvisor', () => {
  it('devolve o resultado do principal quando este for bem-sucedido', async () => {
    const principal: AiAdvisor = {
      aconselhar: async () => okDeIa({ texto: 'resposta principal', origem: 'provedor' }),
    };
    const reserva: AiAdvisor = {
      aconselhar: async () => okDeIa({ texto: 'resposta reserva', origem: 'provedor' }),
    };

    const advisor = new FallbackAdvisor(principal, reserva);
    const resultado = await advisor.aconselhar(pedido);

    expect(resultado.tipo === 'ok' && resultado.dados.texto).toBe('resposta principal');
  });

  it('aciona o reserva quando o principal falhar (ex: 429 cota esgotada ou indisponivel)', async () => {
    const principal: AiAdvisor = {
      aconselhar: async () => falhaDeIa('indisponivel', 'serviço fora do ar'),
    };
    const reserva: AiAdvisor = {
      aconselhar: async () => okDeIa({ texto: 'resposta contingência', origem: 'provedor' }),
    };

    const advisor = new FallbackAdvisor(principal, reserva);
    const resultado = await advisor.aconselhar(pedido);

    expect(resultado.tipo === 'ok' && resultado.dados.texto).toBe('resposta contingência');
  });
});
