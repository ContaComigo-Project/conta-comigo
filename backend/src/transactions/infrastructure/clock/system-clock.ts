import type { Clock } from '../../domain/port/driven/clock';

// Implementacao real da porta: o clock da maquina.
export class SystemClock implements Clock {
  agora(): Date {
    return new Date();
  }
}
