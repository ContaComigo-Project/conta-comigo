import type { Relogio } from '../../domain/port/saida/relogio';

// Implementacao para teste: o tempo e o que o teste disser.
export class RelogioFixo implements Relogio {
  constructor(private readonly instante: Date) {}

  agora(): Date {
    return this.instante;
  }
}
