import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Identidade } from '../../domain/port/saida/identidade';
import type { TitularId } from '../../domain/model/titular';
import { TOKENS_ACESSO } from '../../../acesso/domain/port/saida/tokens';
import type { EmissorDeToken } from '../../../acesso/domain/port/saida/emissor-de-token';

// Substitui a IdentidadeDoCabecalho de HT-008. Agora o titular vem de um access
// token assinado (ADR-004): forjar o cabeçalho deixou de bastar.
//
// A guarda, o filtro por titular e os testes negativos de HT-008 NAO mudaram —
// e essa e a prova de que a porta valeu a pena: trocamos o mecanismo de
// autenticacao sem tocar em dominio, aplicacao ou barreira.
@Injectable({ scope: Scope.REQUEST })
export class IdentidadeDoToken implements Identidade {
  constructor(
    @Inject(REQUEST) private readonly requisicao: { headers?: Record<string, unknown> },
    @Inject(TOKENS_ACESSO.EmissorDeToken) private readonly emissor: EmissorDeToken,
  ) {}

  titularAtual(): TitularId | null {
    const cabecalho = this.requisicao.headers?.authorization;
    const valor = Array.isArray(cabecalho) ? cabecalho[0] : cabecalho;
    if (typeof valor !== 'string') return null;

    const [esquema, token] = valor.split(' ');
    if (esquema?.toLowerCase() !== 'bearer' || !token) return null;

    // Assinatura invalida, token expirado ou formato errado: tudo e "sem titular".
    return this.emissor.validar(token);
  }
}
