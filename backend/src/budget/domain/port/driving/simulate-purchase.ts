export interface ImpactoDeSimulacao {
  readonly category: string;
  readonly limitInCents: number | null;
  readonly spentInCents: number;
  readonly band: string;
  readonly bandComImpacto: string;
  readonly impactoEmCentavos: number;
}

export type ResultadoDaSimulacao = { readonly month: string; readonly categorias: readonly ImpactoDeSimulacao[] };

export interface SimularPlanoDeCompra {
  executar(holderId: string, categoria: string, valorEmCentavos: number, month?: string): Promise<ResultadoDaSimulacao>;
}