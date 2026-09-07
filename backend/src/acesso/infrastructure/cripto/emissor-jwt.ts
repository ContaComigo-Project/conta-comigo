import jwt from 'jsonwebtoken';
import type { TitularId } from '../../../lancamentos/domain/model/titular';
import { titularId } from '../../../lancamentos/domain/model/titular';
import type { EmissorDeToken, TokenEmitido } from '../../domain/port/saida/emissor-de-token';

// Access token curto (ADR-004). O segredo vem do ambiente e NUNCA do
// repositorio (RNF-012): sem ele, o processo recusa subir em vez de assinar com
// um valor padrao — um segredo padrao e o mesmo que nenhum.
const DURACAO_PADRAO_EM_SEGUNDOS = 15 * 60;

export class SegredoDeTokenAusente extends Error {
  constructor() {
    super('JWT_SECRET nao definida: recusando emitir token com segredo padrao.');
    this.name = 'SegredoDeTokenAusente';
  }
}

export class EmissorJwt implements EmissorDeToken {
  private readonly segredo: string;
  private readonly duracaoEmSegundos: number;

  constructor(segredo = process.env.JWT_SECRET, duracaoEmSegundos = DURACAO_PADRAO_EM_SEGUNDOS) {
    if (!segredo) throw new SegredoDeTokenAusente();
    this.segredo = segredo;
    this.duracaoEmSegundos = duracaoEmSegundos;
  }

  emitir(titular: TitularId): TokenEmitido {
    const valor = jwt.sign({ sub: titular }, this.segredo, { expiresIn: this.duracaoEmSegundos });
    return { valor, expiraEm: new Date(Date.now() + this.duracaoEmSegundos * 1000) };
  }

  validar(token: string): TitularId | null {
    try {
      const conteudo = jwt.verify(token, this.segredo);
      const sub = typeof conteudo === 'object' && conteudo !== null ? conteudo.sub : null;
      return typeof sub === 'string' && sub.trim() ? titularId(sub) : null;
    } catch {
      // Assinatura invalida, token expirado ou formato errado: tudo e "nao autenticado".
      return null;
    }
  }
}
