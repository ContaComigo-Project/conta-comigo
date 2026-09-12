export type AnaliseDoDiagnostico = {
  readonly id: 'andamento' | 'comparacao' | 'dicas';
  readonly titulo: string;
  readonly texto: string;
};

export type ResultadoDoDiagnostico =
  | { readonly tipo: 'ok'; readonly analises: readonly AnaliseDoDiagnostico[] }
  | { readonly tipo: 'dados-insuficientes' }
  | { readonly tipo: 'ia-indisponivel'; readonly motivo: string }
  | { readonly tipo: 'teto-atingido' }
  | { readonly tipo: 'ia-bloqueou'; readonly motivo: string };

export interface GetDiagnosis {
  executar(holderId: string): Promise<ResultadoDoDiagnostico>;
}