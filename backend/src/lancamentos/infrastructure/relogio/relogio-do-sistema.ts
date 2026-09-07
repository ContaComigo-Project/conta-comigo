import type { Relogio } from '../../domain/port/saida/relogio';

// Implementacao real da porta: o relogio da maquina.
export class RelogioDoSistema implements Relogio {
  agora(): Date {
    return new Date();
  }
}
