import { Injectable } from '@nestjs/common';
import type { LogEntry } from '../../domain/model/log-entry';
import type { LogSink } from '../../domain/port/driven/log-sink';

// Uma linha JSON por evento em stdout: o formato que qualquer coletor lê sem
// parser proprio, e que o container ja captura sem configuracao (RNF-008).
// LOG_LEVEL corta o ruido sem tirar erro do ar.
const ORDEM = { info: 0, warn: 1, error: 2 } as const;

@Injectable()
export class JsonLogSink implements LogSink {
  private readonly minimo = ORDEM[(process.env.LOG_LEVEL as keyof typeof ORDEM) ?? 'info'] ?? ORDEM.info;

  escrever(entrada: LogEntry): void {
    if (ORDEM[entrada.level] < this.minimo) return;
    process.stdout.write(JSON.stringify(entrada) + '\n');
  }
}
