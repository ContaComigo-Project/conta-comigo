import jwt from 'jsonwebtoken';
import type { HolderId } from '../../../transactions/domain/model/holder';
import { holderId } from '../../../transactions/domain/model/holder';
import type { TokenIssuer, TokenEmitido } from '../../domain/port/driven/token-issuer';

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

export class JwtIssuer implements TokenIssuer {
  private readonly segredo: string;
  private readonly duracaoEmSegundos: number;

  constructor(segredo = process.env.JWT_SECRET, duracaoEmSegundos = DURACAO_PADRAO_EM_SEGUNDOS) {
    if (!segredo) throw new SegredoDeTokenAusente();
    this.segredo = segredo;
    this.duracaoEmSegundos = duracaoEmSegundos;
  }

  emitir(holder: HolderId): TokenEmitido {
    const valor = jwt.sign({ sub: holder }, this.segredo, { expiresIn: this.duracaoEmSegundos });
    return { valor, expiresAt: new Date(Date.now() + this.duracaoEmSegundos * 1000) };
  }

  validar(token: string): HolderId | null {
    try {
      const conteudo = jwt.verify(token, this.segredo);
      const sub = typeof conteudo === 'object' && conteudo !== null ? conteudo.sub : null;
      return typeof sub === 'string' && sub.trim() ? holderId(sub) : null;
    } catch {
      // Assinatura invalida, token expirado ou formato errado: tudo e "nao autenticado".
      return null;
    }
  }
}
