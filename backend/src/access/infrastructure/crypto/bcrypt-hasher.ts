import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '../../domain/port/driven/password-hasher';

// bcrypt atras da porta (ADR-004). O custo e baixo em teste e real em execucao:
// um custo alto em teste transformaria a suite em minutos, e um custo baixo em
// producao seria a vulnerabilidade que o hash deveria evitar.
const CUSTO_PADRAO = 12;
const CUSTO_DE_TESTE = 4;

export class BcryptHasher implements PasswordHasher {
  private readonly custo: number;

  constructor(custo?: number) {
    this.custo = custo ?? (process.env.NODE_ENV === 'test' ? CUSTO_DE_TESTE : CUSTO_PADRAO);
  }

  async gerar(senhaEmClaro: string): Promise<string> {
    return bcrypt.hash(senhaEmClaro, this.custo);
  }

  async conferir(senhaEmClaro: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senhaEmClaro, hash);
  }
}
