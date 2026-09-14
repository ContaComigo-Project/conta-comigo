import type { Account } from '../../model/account';
import type { TokenEmitido } from '../driven/token-issuer';

export interface SessionAberta {
  readonly account: Account;
  readonly access: TokenEmitido;
  readonly refresh: string;
}

export interface CriarAccount {
  executar(emailEmTexto: string, senhaEmClaro: string): Promise<Account>;
}

export interface Authenticate {
  executar(emailEmTexto: string, senhaEmClaro: string): Promise<SessionAberta>;
}

export interface RenovarSession {
  executar(refresh: string): Promise<SessionAberta>;
}

export interface EncerrarSession {
  executar(refresh: string): Promise<void>;
}

/** Recusa unica: nao distingue e-mail inexistente de senha errada (RF-002). */
export class InvalidCredentials extends Error {
  constructor() {
    super('E-mail ou senha invalidos.');
    this.name = 'InvalidCredentials';
  }
}

/** Recusa de cadastro que nao revela se o e-mail ja existia (RF-001). */
export class RegistrationRefused extends Error {
  constructor() {
    super('Nao foi possivel criar a account com esses dados.');
    this.name = 'RegistrationRefused';
  }
}
