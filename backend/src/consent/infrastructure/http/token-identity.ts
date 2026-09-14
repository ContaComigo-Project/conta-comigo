import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { HolderId } from '../../../transactions/domain/model/holder';
import { TOKENS_ACCESS } from '../../../access/domain/port/driven/tokens';
import type { TokenIssuer } from '../../../access/domain/port/driven/token-issuer';
import type { Identity } from '../../domain/port/driven/identity';

// The holder comes from a signed access token (ADR-004); forging the header no
// longer suffices. Same pattern as the transactions context (HT-008 + HN-001).
@Injectable({ scope: Scope.REQUEST })
export class TokenIdentity implements Identity {
  constructor(
    @Inject(REQUEST) private readonly requisicao: { headers?: Record<string, unknown> },
    @Inject(TOKENS_ACCESS.TokenIssuer) private readonly emissor: TokenIssuer,
  ) {}

  holderAtual(): HolderId | null {
    const cabecalho = this.requisicao.headers?.authorization;
    const valor = Array.isArray(cabecalho) ? cabecalho[0] : cabecalho;
    if (typeof valor !== 'string') return null;

    const [esquema, token] = valor.split(' ');
    if (esquema?.toLowerCase() !== 'bearer' || !token) return null;

    return this.emissor.validar(token);
  }
}