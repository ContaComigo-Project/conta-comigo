import type { UsageCounter } from '../../domain/port/driven/usage-counter';

export class UsageCounterEmMemoria implements UsageCounter {
  private readonly usos = new Map<string, number>();

  async usoDoDia(holder: string, dia: string): Promise<number> {
    return this.usos.get(`${holder}:${dia}`) ?? 0;
  }

  async registrarUso(holder: string, dia: string): Promise<void> {
    const chave = `${holder}:${dia}`;
    this.usos.set(chave, (this.usos.get(chave) ?? 0) + 1);
  }
}
