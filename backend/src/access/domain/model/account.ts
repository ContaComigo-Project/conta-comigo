import type { Email } from './email';

// A account guarda HASH, nunca senha. A senha em claro nao entra no dominio: quem
// a transforma e a porta PasswordHasher, na borda.
export interface Account {
  readonly id: string;
  readonly email: Email;
  readonly passwordHash: string;
  /** Display name from the profile; may be empty until edited. */
  readonly name: string;
}
