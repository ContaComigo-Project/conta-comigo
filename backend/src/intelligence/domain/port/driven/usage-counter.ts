// Porta do contador de uso (RNF-009). Conta por titular e por dia.
export interface UsageCounter {
  usoDoDia(holder: string, dia: string): Promise<number>;
  registrarUso(holder: string, dia: string): Promise<void>;
}
