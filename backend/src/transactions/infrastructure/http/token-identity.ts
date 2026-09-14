import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Identity } from '../../domain/port/driven/identity';
import type { HolderId } from '../../domain/model/holder';
import { TOKENS_ACCESS } from '../../../access/domain/port/driven/tokens';
import type { TokenIssuer } from '../../../access/domain/port/driven/token-issuer';

// Substitui a IdentityDoCabecalho de HT-008. Agora o holder vem de um access
// token assinado (ADR-004): forjar o cabeçalho deixou de bastar.
//
// A guarda, o filtro por holder e os testes negativos de HT-008 NAO mudaram —
// e essa e a prova de que a porta valeu a pena: trocamos o mecanismo de
// autenticacao sem tocar em dominio, aplicacao ou barreira.
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

    // Assinatura invalida, token expirado ou formato errado: tudo e "sem holder".
    return this.emissor.validar(token);
  }
}
