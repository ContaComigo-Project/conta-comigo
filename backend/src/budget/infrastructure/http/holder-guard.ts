import { CanActivate, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import type { Identity } from '../../../transactions/domain/port/driven/identity';

/** Token da identidade dentro do contexto `budget` (ADR-001, regra adicional 3). */
export const TOKEN_IDENTITY_BUDGET = Symbol.for('budget/Identity');

// A barreira de RNF-013 tambem aqui: toda rota de orcamento exige credencial.
// Recusa com 401 e nada mais; o filtro por titular (RN-015) e do repositorio.
@Injectable({ scope: Scope.REQUEST })
export class GuardaDeHolderDoBudget implements CanActivate {
  constructor(@Inject(TOKEN_IDENTITY_BUDGET) private readonly identity: Identity) {}

  canActivate(): boolean {
    if (this.identity.holderAtual() === null) throw new UnauthorizedException();
    return true;
  }
}
