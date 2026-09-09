import { describe, expect, it } from 'vitest';
import { REDACTED, logEntry, redact } from './log-entry';
import { requestId } from './request-id';

// RNF-015: nenhum dado financeiro ou pessoal aparece em log. A prova vive no
// dominio, sem framework: e regra, nao detalhe de transporte.
describe('redact — RNF-015', () => {
  it('troca o valor de chave sensivel pelo marcador, preservando a chave', () => {
    const redigido = redact({ email: 'pessoa@exemplo.com', password: 'segredo123', route: '/access/sessions' });

    expect(redigido).toEqual({ email: REDACTED, password: REDACTED, route: '/access/sessions' });
  });

  it('atravessa objeto aninhado e array', () => {
    const redigido = redact({
      operation: 'POST /consent/connections',
      body: { credential: { user: 'ana', token: 'abc' } },
      transactions: [{ description: 'mercado', amountInCents: 12_000 }],
    });

    expect(redigido).toEqual({
      operation: 'POST /consent/connections',
      body: { credential: REDACTED },
      transactions: [{ description: REDACTED, amountInCents: REDACTED }],
    });
  });

  it('reconhece a chave sem depender de caixa, acento ou separador', () => {
    const redigido = redact({ Authorization: 'Bearer x', 'refresh-token': 'y', hash_da_senha: 'z' });

    expect(Object.values(redigido as Record<string, unknown>)).toEqual([REDACTED, REDACTED, REDACTED]);
  });

  it('deixa passar o que diagnostica: rota, status, duracao', () => {
    const dados = { method: 'GET', route: '/transactions', status: 500, durationMs: 12 };

    expect(redact(dados)).toEqual(dados);
  });

  it('nao explode em valor primitivo, nulo nem em ciclo', () => {
    const ciclico: Record<string, unknown> = { route: '/x' };
    ciclico.self = ciclico;

    expect(redact(null)).toBeNull();
    expect(redact('texto')).toBe('texto');
    expect(redact(ciclico)).toEqual({ route: '/x', self: '[ciclo]' });
  });
});

describe('logEntry', () => {
  it('monta a entrada com nivel, correlacao e horario ISO, ja redigida', () => {
    const entrada = logEntry({
      level: 'error',
      message: 'falha na operacao',
      requestId: requestId('req-1'),
      at: new Date('2026-09-08T12:00:00.000Z'),
      data: { operation: 'GET /transactions', email: 'pessoa@exemplo.com' },
    });

    expect(entrada).toEqual({
      level: 'error',
      message: 'falha na operacao',
      requestId: 'req-1',
      timestamp: '2026-09-08T12:00:00.000Z',
      operation: 'GET /transactions',
      email: REDACTED,
    });
  });

  it('a mensagem tambem passa pela redacao — erro do banco costuma citar valor', () => {
    const entrada = logEntry({
      level: 'error',
      message: 'duplicate key value violates unique constraint: email=pessoa@exemplo.com',
      requestId: requestId('req-2'),
      at: new Date('2026-09-08T12:00:00.000Z'),
    });

    expect(entrada.message).not.toContain('pessoa@exemplo.com');
  });
});
