import type { Conselho } from '../../domain/model/advice';
import type { AdviceCache } from '../../domain/port/driven/advice-cache';

// Cache de processo: serve o teste e o ambiente sem banco. Some no reinicio —
// por isso a PoC usa o adaptador Prisma, e nao este.
export class AdviceCacheEmMemoria implements AdviceCache {
  private readonly guardados = new Map<string, Conselho>();

  async buscar(chave: string): Promise<Conselho | null> {
    return this.guardados.get(chave) ?? null;
  }

  async guardar(chave: string, conselho: Conselho): Promise<void> {
    this.guardados.set(chave, conselho);
  }
}
