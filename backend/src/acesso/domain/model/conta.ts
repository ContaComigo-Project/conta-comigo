import type { Email } from './email';

// A conta guarda HASH, nunca senha. A senha em claro nao entra no dominio: quem
// a transforma e a porta HashDeSenha, na borda.
export interface Conta {
  readonly id: string;
  readonly email: Email;
  readonly hashDaSenha: string;
}
