import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Identidade } from '../../domain/port/saida/identidade';
import { titularId, type TitularId } from '../../domain/model/titular';

// IMPLEMENTACAO PROVISORIA — isto NAO e autenticacao.
//
// Le `x-titular-id` do cabecalho, que qualquer cliente pode forjar. Existe para
// que a BARREIRA (guarda + filtro por titular) seja construida e provada agora,
// antes de HN-001; o comportamento de borda ja e o final — sem credencial, nao
// passa. HN-001 substitui esta classe por validacao de JWT (ADR-004) sem tocar
// dominio, aplicacao nem guarda: e para isso que a porta existe.
@Injectable({ scope: Scope.REQUEST })
export class IdentidadeDoCabecalho implements Identidade {
  constructor(@Inject(REQUEST) private readonly requisicao: { headers?: Record<string, unknown> }) {}

  titularAtual(): TitularId | null {
    const cabecalho = this.requisicao.headers?.['x-titular-id'];
    const valor = Array.isArray(cabecalho) ? cabecalho[0] : cabecalho;
    return typeof valor === 'string' && valor.trim() ? titularId(valor) : null;
  }
}
