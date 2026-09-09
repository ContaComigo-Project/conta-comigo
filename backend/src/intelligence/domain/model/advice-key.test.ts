import { describe, expect, it } from 'vitest';
import type { PedidoDeConselho } from './advice';
import { chaveDoConselho, impressaoDe } from './advice-key';
import { dentroDoTeto, diaDe, tetoConfigurado, TETO_DIARIO_PADRAO } from './daily-quota';

const pedido = (extra: Partial<PedidoDeConselho> = {}): PedidoDeConselho => ({
  holder: 'holder-a',
  tipo: 'diagnostico-do-mes',
  pergunta: 'como foi meu mes?',
  dados: { totalEmCentavos: 120_000 },
  ...extra,
});

describe('chaveDoConselho — RNF-010', () => {
  it('mesmo pedido, mesma chave', () => {
    expect(chaveDoConselho(pedido())).toBe(chaveDoConselho(pedido()));
  });

  it('a ordem das propriedades dos dados nao muda a chave', () => {
    const a = pedido({ dados: { mercado: 1, transporte: 2 } });
    const b = pedido({ dados: { transporte: 2, mercado: 1 } });

    expect(chaveDoConselho(a)).toBe(chaveDoConselho(b));
  });

  it('titular, tipo, pergunta e dados entram na chave', () => {
    const base = chaveDoConselho(pedido());

    expect(chaveDoConselho(pedido({ holder: 'holder-b' }))).not.toBe(base);
    expect(chaveDoConselho(pedido({ tipo: 'pergunta-livre' }))).not.toBe(base);
    expect(chaveDoConselho(pedido({ pergunta: 'e o proximo mes?' }))).not.toBe(base);
    expect(chaveDoConselho(pedido({ dados: { totalEmCentavos: 120_001 } }))).not.toBe(base);
  });

  it('a impressao muda quando um centavo muda', () => {
    expect(impressaoDe({ v: 100 })).not.toBe(impressaoDe({ v: 101 }));
  });
});

describe('teto diario — RNF-009', () => {
  it('o dia e o do instante em UTC', () => {
    expect(diaDe(new Date('2026-09-08T23:59:59Z'))).toBe('2026-09-08');
    expect(diaDe(new Date('2026-09-09T00:00:00Z'))).toBe('2026-09-09');
  });

  it('valor invalido de configuracao cai no padrao, nunca em "sem teto"', () => {
    expect(tetoConfigurado('50')).toBe(50);
    expect(tetoConfigurado(undefined)).toBe(TETO_DIARIO_PADRAO);
    expect(tetoConfigurado('abacaxi')).toBe(TETO_DIARIO_PADRAO);
    expect(tetoConfigurado('-1')).toBe(TETO_DIARIO_PADRAO);
    expect(tetoConfigurado('0')).toBe(TETO_DIARIO_PADRAO);
  });

  it('o limite e exclusivo: com teto 3, o quarto pedido nao passa', () => {
    expect(dentroDoTeto(2, 3)).toBe(true);
    expect(dentroDoTeto(3, 3)).toBe(false);
  });
});
