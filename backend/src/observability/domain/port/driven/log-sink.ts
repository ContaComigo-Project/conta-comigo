import type { LogEntry } from '../../model/log-entry';

// Porta de saida (ADR-001): o dominio decide O QUE registrar; para onde a linha
// vai — stdout, memoria, servico externo — e escolha do adaptador.
export interface LogSink {
  escrever(entrada: LogEntry): void;
}
