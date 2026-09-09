import { describe, expect, it } from 'vitest';
import { limparDescricao, precisaDeAjuda } from './readable-description';

// RF-010: descricao tecnica vira algo que a pessoa reconhece.
// RN-010: o que o tradutor nao reconhece mantem o texto original.
describe('limparDescricao — RF-010', () => {
  it('remove prefixo de adquirente', () => {
    expect(limparDescricao('PAG*MERCADO CENTRAL')).toBe('Mercado Central');
    expect(limparDescricao('PG *PADARIA DO ZE')).toBe('Padaria do Ze');
    expect(limparDescricao('TEF COMPRA SUPERMERCADO BOM')).toBe('Supermercado Bom');
  });

  it('remove sufixo de parcela e codigo solto', () => {
    expect(limparDescricao('MERCADO CENTRAL 04/12')).toBe('Mercado Central');
    expect(limparDescricao('RESTAURANTE SABOR 0293847')).toBe('Restaurante Sabor');
  });

  it('reconhece estabelecimento conhecido mesmo com ruido em volta', () => {
    expect(limparDescricao('UBER *TRIP HELP.UBER')).toBe('Uber');
    expect(limparDescricao('NETFLIX.COM')).toBe('Netflix');
    expect(limparDescricao('IFD*IFOOD CLUB')).toBe('iFood');
    expect(limparDescricao('AMAZON BR SERVICOS')).toBe('Amazon');
  });

  it('normaliza a caixa alta sem estragar preposicao', () => {
    expect(limparDescricao('CASA DE CARNES DO JOAO')).toBe('Casa de Carnes do Joao');
  });

  it('RN-010 — o que nao reconhece devolve o proprio texto, sem inventar', () => {
    expect(limparDescricao('X9ZQ')).toBe('X9ZQ');
    expect(limparDescricao('')).toBe('');
    expect(limparDescricao('   ')).toBe('   ');
  });

  it('nao devolve string vazia por excesso de limpeza', () => {
    // So codigo: limpar tudo deixaria a linha sem descricao nenhuma na tela.
    expect(limparDescricao('0293847')).toBe('0293847');
    expect(limparDescricao('PAG*')).toBe('PAG*');
  });
});

describe('precisaDeAjuda — quando vale gastar IA', () => {
  it('o que ficou reconhecivel nao vai para o provedor', () => {
    expect(precisaDeAjuda('Mercado Central')).toBe(false);
    expect(precisaDeAjuda('Uber')).toBe(false);
  });

  it('sigla curta, codigo e sopa de consoante pedem ajuda', () => {
    expect(precisaDeAjuda('X9ZQ')).toBe(true);
    expect(precisaDeAjuda('0293847')).toBe(true);
    expect(precisaDeAjuda('LJ 4021 CP')).toBe(true);
  });
});
