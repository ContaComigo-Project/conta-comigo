import { CanActivate, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import type { Identity } from '../../domain/port/driven/identity';
import { TOKENS } from '../../domain/port/driven/tokens';

// A barreira de RNF-013, no servidor. Toda route do modulo passa por aqui: o
// padrao e proteger, e a excecao — se um dia houver route publica — precisa ser
// declarada explicitamente, nunca o contrario.
//
// Recusa sem revelar nada: quem nao tem credencial recebe 401 e mais nada. O
// filtro por holder (RN-015) e do repositorio; esta guarda so garante que
// existe um holder para filtrar.
@Injectable({ scope: Scope.REQUEST })
export class GuardaDeHolder implements CanActivate {
  constructor(@Inject(TOKENS.Identity) private readonly identity: Identity) {}

  canActivate(): boolean {
    if (this.identity.holderAtual() === null) throw new UnauthorizedException();
    return true;
  }
}
