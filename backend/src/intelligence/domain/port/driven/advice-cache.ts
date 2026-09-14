import type { Conselho } from '../../model/advice';

// Porta do cache (RNF-010). Em memoria no teste, no banco na PoC: o custo
// evitado precisa sobreviver ao reinicio do processo.
export interface AdviceCache {
  buscar(chave: string): Promise<Conselho | null>;
  guardar(chave: string, conselho: Conselho): Promise<void>;
}
