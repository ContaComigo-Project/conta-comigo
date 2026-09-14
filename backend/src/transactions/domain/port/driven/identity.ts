import type { HolderId } from '../../model/holder';

// Quem esta pedindo. Porta de saida (ADR-001): o caso de uso recebe o holder ja
// resolvido e nunca ve cabecalho, cookie ou token — HN-001 troca a implementacao
// por JWT (ADR-004) sem tocar dominio nem aplicacao.
//
// `null` significa "sem credencial". A borda decide o que fazer com isso; o
// dominio nao inventa um holder anonimo.
export interface Identity {
  holderAtual(): HolderId | null;
}
