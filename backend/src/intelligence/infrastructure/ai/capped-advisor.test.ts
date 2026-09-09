import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from '../../domain/model/advice';
import { okDeIa } from '../../domain/model/ai-result';
import type { AiAdvisor } from '../../domain/port/driven/ai-advisor';
import type { Clock } from '../../domain/port/driven/clock';
import { UsageCounterEmMemoria } from '../persistence/usage-counter-memory';
import { CappedAdvisor } from './capped-advisor';

const pedido = (holder = 'holder-a'): PedidoDeConselho => ({
  holder,
  tipo: 'pergunta-livre',
  pergunta: 'devo cortar streaming?',
  dados: {},
});

class ContadorDeChamadas implements AiAdvisor {
  chamadas = 0;

  async aconselhar() {
    this.chamadas += 1;
    return okDeIa({ texto: 'resposta', origem: 'provedor' as const });
  }
}

const relogioFixo = (iso: string): Clock => ({ agora: () => new Date(iso) });

// RNF-009: o uso de IA cabe no free tier — teto explicito por pessoa por dia,
// com recusa educada ao ultrapassar.
describe('CappedAdvisor — RNF-009', () => {
  it('deixa passar ate o teto e recusa a partir dele, sem chamar o provedor', async () => {
    const provedor = new ContadorDeChamadas();
    const advisor = new CappedAdvisor(provedor, new UsageCounterEmMemoria(), relogioFixo('2026-09-08T12:00:00Z'), 3);

    for (let i = 0; i < 3; i += 1) {
      const resultado = await advisor.aconselhar(pedido());
      expect(resultado.tipo).toBe('ok');
    }

    const excedente = await advisor.aconselhar(pedido());

    expect(provedor.chamadas).toBe(3);
    expect(excedente.tipo).toBe('falha');
    expect(excedente.tipo === 'falha' && excedente.motivo).toBe('teto-atingido');
    // Recusa educada, nao mensagem de erro tecnico: quem le e uma pessoa.
    expect(excedente.tipo === 'falha' && excedente.detalhe).toMatch(/limite/i);
  });

  it('o teto e por titular: uma pessoa no limite nao bloqueia a outra', async () => {
    const provedor = new ContadorDeChamadas();
    const advisor = new CappedAdvisor(provedor, new UsageCounterEmMemoria(), relogioFixo('2026-09-08T12:00:00Z'), 1);

    await advisor.aconselhar(pedido('holder-a'));
    const bloqueado = await advisor.aconselhar(pedido('holder-a'));
    const outro = await advisor.aconselhar(pedido('holder-b'));

    expect(bloqueado.tipo).toBe('falha');
    expect(outro.tipo).toBe('ok');
  });

  it('o teto vira no dia seguinte, em UTC', async () => {
    const provedor = new ContadorDeChamadas();
    const contador = new UsageCounterEmMemoria();
    const hoje = new CappedAdvisor(provedor, contador, relogioFixo('2026-09-08T23:59:00Z'), 1);
    const amanha = new CappedAdvisor(provedor, contador, relogioFixo('2026-09-09T00:01:00Z'), 1);

    await hoje.aconselhar(pedido());
    const bloqueado = await hoje.aconselhar(pedido());
    const novoDia = await amanha.aconselhar(pedido());

    expect(bloqueado.tipo).toBe('falha');
    expect(novoDia.tipo).toBe('ok');
  });

  it('falha do provedor nao consome a cota do dia', async () => {
    const provedor: AiAdvisor = {
      aconselhar: async () => ({ tipo: 'falha', motivo: 'indisponivel', detalhe: 'fora do ar' }),
    };
    const contador = new UsageCounterEmMemoria();
    const advisor = new CappedAdvisor(provedor, contador, relogioFixo('2026-09-08T12:00:00Z'), 2);

    await advisor.aconselhar(pedido());

    expect(await contador.usoDoDia('holder-a', '2026-09-08')).toBe(0);
  });
});
