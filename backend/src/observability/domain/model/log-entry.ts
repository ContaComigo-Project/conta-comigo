import type { RequestId } from './request-id';

// A entrada de log e a regra desta historia, nao detalhe de transporte: o que
// entra, o que e redigido e como fica o formato final (RNF-008, RNF-015).
// TypeScript puro — nenhum framework, nenhuma escrita (ADR-001).

export type LogLevel = 'info' | 'warn' | 'error';

export const REDACTED = '[redigido]';

// Redacao por nome de chave. E o unico criterio disponivel sem conhecer o
// formato de cada payload, e erra para o lado seguro: chave com nome sensivel
// some inteira (mesmo sendo objeto), chave que diagnostica permanece.
const CHAVES_SENSIVEIS = [
  'password',
  'senha',
  'passwordhash',
  'hashdasenha',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'secret',
  'segredo',
  'credential',
  'credenciais',
  'cipher',
  'email',
  'cpf',
  'name',
  'nome',
  'description',
  'descricao',
  'amountincents',
  'balanceincents',
  'valor',
  'saldo',
];

// Um e-mail costuma vazar dentro da mensagem de erro do banco, fora de qualquer
// chave. A mensagem tambem passa pela redacao por isso.
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

function ehSensivel(chave: string): boolean {
  const normalizada = chave.toLowerCase().replace(/[^a-z]/g, '');
  return CHAVES_SENSIVEIS.includes(normalizada);
}

export function redactText(texto: string): string {
  return texto.replace(EMAIL, REDACTED);
}

export function redact(valor: unknown, vistos: WeakSet<object> = new WeakSet()): unknown {
  if (typeof valor === 'string') return redactText(valor);
  if (valor === null || typeof valor !== 'object') return valor;

  // Referencia ciclica existe em objeto de framework; o log nao pode travar por
  // causa disso.
  if (vistos.has(valor)) return '[ciclo]';
  vistos.add(valor);

  if (Array.isArray(valor)) return valor.map((item) => redact(item, vistos));

  const saida: Record<string, unknown> = {};
  for (const [chave, conteudo] of Object.entries(valor)) {
    saida[chave] = ehSensivel(chave) ? REDACTED : redact(conteudo, vistos);
  }
  return saida;
}

export type LogEntry = {
  level: LogLevel;
  message: string;
  requestId: RequestId | string;
  timestamp: string;
  [campo: string]: unknown;
};

export function logEntry(entrada: {
  level: LogLevel;
  message: string;
  requestId: RequestId;
  at: Date;
  data?: Record<string, unknown>;
}): LogEntry {
  const dados = (redact(entrada.data ?? {}) as Record<string, unknown>) ?? {};
  return {
    level: entrada.level,
    message: redactText(entrada.message),
    requestId: entrada.requestId,
    timestamp: entrada.at.toISOString(),
    ...dados,
  };
}
