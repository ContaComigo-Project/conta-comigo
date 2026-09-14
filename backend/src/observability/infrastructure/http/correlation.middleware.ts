import { randomUUID } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { ProximoPasso, RequisicaoHttp, RespostaHttp } from './express-shapes';
import { requestId, type RequestId } from '../../domain/model/request-id';

export const CABECALHO_CORRELACAO = 'x-request-id';

// O identificador viaja no objeto da requisicao, nao em estado global: nada de
// AsyncLocalStorage nem singleton mutavel (ADR-001, teste sem magia).
type RequisicaoCorrelacionada = RequisicaoHttp & { requestId?: RequestId };

export function correlacaoDe(requisicao: unknown): RequestId {
  const marcada = requisicao as RequisicaoCorrelacionada | undefined;
  return marcada?.requestId ?? requestId('sem-correlacao');
}

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(requisicao: RequisicaoCorrelacionada, resposta: RespostaHttp, seguir: ProximoPasso): void {
    const recebido = requisicao.headers[CABECALHO_CORRELACAO];
    const bruto = Array.isArray(recebido) ? recebido[0] : recebido;

    // Preserva o valor de fora quando existe — e assim que a correlacao
    // atravessa servicos — e gera um quando nao existe.
    const correlacao = requestId(bruto && bruto.trim() !== '' ? bruto : randomUUID());

    requisicao.requestId = correlacao;
    resposta.setHeader(CABECALHO_CORRELACAO, correlacao);
    seguir();
  }
}
