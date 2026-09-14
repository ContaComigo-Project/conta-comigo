import type { MotivoDoBloqueio } from '../../model/output-guard';

// Porta de registro do bloqueio (HT-012 + RNF-017). Quem opera precisa saber
// que a guarda reprovou e por que — sem que o texto suspeito inteiro vá para o
// log. A amostra e curta de proposito.
export interface GuardLog {
  bloqueio(motivo: MotivoDoBloqueio, amostra: string): void;
}
