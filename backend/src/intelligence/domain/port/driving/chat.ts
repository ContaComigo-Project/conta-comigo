export type RespostaDoChat =
  | { readonly tipo: 'ok'; readonly resposta: string; readonly aviso: string }
  | { readonly tipo: 'ia-indisponivel'; readonly motivo: string }
  | { readonly tipo: 'teto-atingido' }
  | { readonly tipo: 'ia-bloqueou'; readonly motivo: string };

export interface PerguntarNoChat {
  executar(holderId: string, pergunta: string): Promise<RespostaDoChat>;
}