import { logEntry } from '../../../observability/domain/model/log-entry';
import { requestId } from '../../../observability/domain/model/request-id';
import type { LogSink } from '../../../observability/domain/port/driven/log-sink';
import type { MotivoDoBloqueio } from '../../domain/model/output-guard';
import type { GuardLog } from '../../domain/port/driven/guard-log';

// Adaptador do registro de bloqueio sobre o log estruturado de HT-012.
// Infraestrutura falando com infraestrutura: o dominio de `intelligence` conhece
// apenas a porta GuardLog, e nao o contexto de observabilidade (ADR-001).
export class GuardLogEstruturado implements GuardLog {
  constructor(private readonly sink: LogSink) {}

  bloqueio(motivo: MotivoDoBloqueio, amostra: string): void {
    this.sink.escrever(
      logEntry({
        level: 'warn',
        message: 'saida da IA bloqueada pela guarda',
        requestId: requestId('ia'),
        at: new Date(),
        data: { motivo, amostra },
      }),
    );
  }
}
