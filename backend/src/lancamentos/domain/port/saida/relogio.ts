// Porta de saida obrigatoria (ADR-001, regra adicional 2): RN-003 e RN-005 so
// sao testaveis com o tempo sob controle.
export interface Relogio {
  agora(): Date;
}
