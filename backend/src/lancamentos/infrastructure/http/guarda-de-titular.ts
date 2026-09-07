import { CanActivate, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import type { Identidade } from '../../domain/port/saida/identidade';
import { TOKENS } from '../../domain/port/saida/tokens';

// A barreira de RNF-013, no servidor. Toda rota do modulo passa por aqui: o
// padrao e proteger, e a excecao — se um dia houver rota publica — precisa ser
// declarada explicitamente, nunca o contrario.
//
// Recusa sem revelar nada: quem nao tem credencial recebe 401 e mais nada. O
// filtro por titular (RN-015) e do repositorio; esta guarda so garante que
// existe um titular para filtrar.
@Injectable({ scope: Scope.REQUEST })
export class GuardaDeTitular implements CanActivate {
  constructor(@Inject(TOKENS.Identidade) private readonly identidade: Identidade) {}

  canActivate(): boolean {
    if (this.identidade.titularAtual() === null) throw new UnauthorizedException();
    return true;
  }
}
