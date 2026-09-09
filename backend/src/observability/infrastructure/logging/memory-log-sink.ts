import type { LogEntry } from '../../domain/model/log-entry';
import type { LogSink } from '../../domain/port/driven/log-sink';

// Sink de teste: guarda a linha em vez de escrever. Permite afirmar sobre o que
// foi registrado sem capturar stdout do processo.
export class MemoryLogSink implements LogSink {
  readonly entradas: LogEntry[] = [];

  escrever(entrada: LogEntry): void {
    this.entradas.push(entrada);
  }

  limpar(): void {
    this.entradas.length = 0;
  }
}
