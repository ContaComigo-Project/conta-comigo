import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ConnectedBankDTO,
  SpendingCategoryDTO,
  CategoriaDeOrcamentoDTO,
  Faixa,
  TransactionDTO,
  ResumoDoMesDTO,
  resultadoDe,
} from './index';

// O contrato e verificado por esquema: um exemplo valido passa, e os campos que
// o inventario (HT-016) marcou como acidente visual sao REJEITADOS. Se alguem
// tentar colocar `formattedAmount` no transporte, este teste fica vermelho.

const transactionValido = {
  id: 'txn_001',
  description: 'Uber',
  estabelecimento: 'Uber Brasil',
  categoria: { id: 'transporte', nome: 'Transporte' },
  instituicao: { id: 'nubank', nome: 'Nubank' },
  amountInCents: -3490,
  tipo: 'debito',
  dueDate: '2026-09-05T15:30:00.000Z',
};

describe('contrato — TransactionDTO', () => {
  it('aceita um transaction valido', () => {
    expect(TransactionDTO.safeParse(transactionValido).success).toBe(true);
  });

  it('exige valor inteiro em centavos (RN-006)', () => {
    expect(TransactionDTO.safeParse({ ...transactionValido, amountInCents: -34.9 }).success).toBe(false);
  });

  it('exige data ISO', () => {
    expect(TransactionDTO.safeParse({ ...transactionValido, dueDate: '05/09/2026' }).success).toBe(false);
  });

  it('rejeita campos de apresentacao: formattedAmount, formattedDate, categoryIcon, bankColor', () => {
    for (const campo of ['formattedAmount', 'formattedDate', 'categoryIcon', 'bankColor']) {
      const r = TransactionDTO.safeParse({ ...transactionValido, [campo]: 'x' });
      expect(r.success, `${campo} deveria ser rejeitado`).toBe(false);
    }
  });

  it('tipo e debito ou credito', () => {
    expect(TransactionDTO.safeParse({ ...transactionValido, tipo: 'debit' }).success).toBe(false);
  });
});

describe('contrato — ResumoDoMesDTO', () => {
  it('aceita o resumo que a API ja produz', () => {
    const r = ResumoDoMesDTO.safeParse({ mes: { ano: 2026, mes: 9 }, quantidade: 2, totalEmCentavos: 3550 });
    expect(r.success).toBe(true);
  });

  it('mes entre 1 e 12', () => {
    expect(ResumoDoMesDTO.safeParse({ mes: { ano: 2026, mes: 13 }, quantidade: 0, totalEmCentavos: 0 }).success).toBe(false);
  });
});

describe('contrato — budget', () => {
  it('faixa e um dos quatro valores de RN-001/RN-002', () => {
    for (const f of ['verde', 'amarela', 'vermelha', 'sem-limite']) expect(Faixa.safeParse(f).success).toBe(true);
    expect(Faixa.safeParse('amarelo').success).toBe(false);
    expect(Faixa.safeParse('verde-claro').success).toBe(false);
  });

  it('categoria de budget transporta a faixa pronta e rejeita classes CSS', () => {
    const valida = {
      categoria: { id: 'alimentacao', nome: 'Alimentacao' },
      mes: { ano: 2026, mes: 9 },
      limiteEmCentavos: 80000,
      gastoEmCentavos: 60000,
      faixa: 'amarela',
    };
    expect(CategoriaDeOrcamentoDTO.safeParse(valida).success).toBe(true);
    expect(CategoriaDeOrcamentoDTO.safeParse({ ...valida, barClass: 'bg-emerald-500' }).success).toBe(false);
    expect(CategoriaDeOrcamentoDTO.safeParse({ ...valida, faixa: undefined }).success).toBe(false);
  });

  it('sem limite: limiteEmCentavos nulo e faixa "sem-limite" (RN-002)', () => {
    const r = CategoriaDeOrcamentoDTO.safeParse({
      categoria: { id: 'lazer', nome: 'Lazer' },
      mes: { ano: 2026, mes: 9 },
      limiteEmCentavos: null,
      gastoEmCentavos: 12000,
      faixa: 'sem-limite',
    });
    expect(r.success).toBe(true);
  });
});

describe('contrato — banco e categoria de gasto', () => {
  it('banco conectado sem cor nem iniciais, status em portugues', () => {
    const valido = { id: 'nubank', nome: 'Nubank', saldoEmCentavos: 152030, status: 'ativo', ultimaSincronizacao: '2026-09-07T12:00:00.000Z' };
    expect(ConnectedBankDTO.safeParse(valido).success).toBe(true);
    expect(ConnectedBankDTO.safeParse({ ...valido, color: '#8B5CF6' }).success).toBe(false);
    expect(ConnectedBankDTO.safeParse({ ...valido, status: 'active' }).success).toBe(false);
  });

  it('categoria de gasto transporta total, nao cor nem icone', () => {
    const valida = { categoria: { id: 'mercado', nome: 'Mercado' }, totalEmCentavos: 45000 };
    expect(SpendingCategoryDTO.safeParse(valida).success).toBe(true);
    expect(SpendingCategoryDTO.safeParse({ ...valida, color: '#fff' }).success).toBe(false);
  });
});

describe('contrato — Result<T> (RN-020, RN-021)', () => {
  const esquema = resultadoDe(z.array(TransactionDTO));

  it('estado ok carrega dados', () => {
    expect(esquema.safeParse({ estado: 'ok', dados: [transactionValido] }).success).toBe(true);
  });

  it('estado error carrega codigo e mensagem, sem dados', () => {
    expect(esquema.safeParse({ estado: 'error', codigo: 'provedor-indisponivel', mensagem: 'Pluggy fora' }).success).toBe(true);
    expect(esquema.safeParse({ estado: 'error' }).success).toBe(false);
  });

  it('estado dados-insuficientes carrega motivo', () => {
    expect(esquema.safeParse({ estado: 'dados-insuficientes', motivo: 'nenhum mes fechado' }).success).toBe(true);
  });

  it('estado desconhecido e rejeitado', () => {
    expect(esquema.safeParse({ estado: 'talvez', dados: [] }).success).toBe(false);
  });

  it('ok sem dados e rejeitado', () => {
    expect(esquema.safeParse({ estado: 'ok' }).success).toBe(false);
  });
});
