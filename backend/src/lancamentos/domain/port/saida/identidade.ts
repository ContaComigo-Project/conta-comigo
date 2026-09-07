import type { TitularId } from '../../model/titular';

// Quem esta pedindo. Porta de saida (ADR-001): o caso de uso recebe o titular ja
// resolvido e nunca ve cabecalho, cookie ou token — HN-001 troca a implementacao
// por JWT (ADR-004) sem tocar dominio nem aplicacao.
//
// `null` significa "sem credencial". A borda decide o que fazer com isso; o
// dominio nao inventa um titular anonimo.
export interface Identidade {
  titularAtual(): TitularId | null;
}
