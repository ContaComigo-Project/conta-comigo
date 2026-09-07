import type { Conta } from '../../model/conta';
import type { TokenEmitido } from '../saida/emissor-de-token';

export interface SessaoAberta {
  readonly conta: Conta;
  readonly acesso: TokenEmitido;
  readonly refresh: string;
}

export interface CriarConta {
  executar(emailEmTexto: string, senhaEmClaro: string): Promise<Conta>;
}

export interface Autenticar {
  executar(emailEmTexto: string, senhaEmClaro: string): Promise<SessaoAberta>;
}

export interface RenovarSessao {
  executar(refresh: string): Promise<SessaoAberta>;
}

export interface EncerrarSessao {
  executar(refresh: string): Promise<void>;
}

/** Recusa unica: nao distingue e-mail inexistente de senha errada (RF-002). */
export class CredenciaisInvalidas extends Error {
  constructor() {
    super('E-mail ou senha invalidos.');
    this.name = 'CredenciaisInvalidas';
  }
}

/** Recusa de cadastro que nao revela se o e-mail ja existia (RF-001). */
export class CadastroRecusado extends Error {
  constructor() {
    super('Nao foi possivel criar a conta com esses dados.');
    this.name = 'CadastroRecusado';
  }
}
