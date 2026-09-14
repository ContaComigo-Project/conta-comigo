import type { Clock } from '../../domain/port/driven/clock';

export class SystemClock implements Clock {
  agora(): Date {
    return new Date();
  }
}
