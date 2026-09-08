import { CanActivate, Inject, Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import type { Identity } from '../../domain/port/driven/identity';
import { TOKENS_CONSENT } from '../../domain/port/driven/consent-repository';

// RNF-013 barrier, on the server: every route of the module passes here. Denies
// with nothing (401) when there is no credential.
@Injectable({ scope: Scope.REQUEST })
export class HolderGuard implements CanActivate {
  constructor(@Inject(TOKENS_CONSENT.Identity) private readonly identidade: Identity) {}

  canActivate(): boolean {
    if (this.identidade.holderAtual() === null) throw new UnauthorizedException();
    return true;
  }
}