// Porta: transformar e conferir senha. O dominio nao conhece bcrypt (ADR-004).
export interface PasswordHasher {
  gerar(senhaEmClaro: string): Promise<string>;
  conferir(senhaEmClaro: string, hash: string): Promise<boolean>;
}
