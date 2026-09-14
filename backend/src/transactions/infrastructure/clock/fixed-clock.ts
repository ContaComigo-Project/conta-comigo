import type { Clock } from '../../domain/port/driven/clock';

// Implementacao para teste: o tempo e o que o teste disser.
export class FixedClock implements Clock {
  constructor(private readonly instante: Date) {}

  agora(): Date {
    return this.instante;
  }
}
