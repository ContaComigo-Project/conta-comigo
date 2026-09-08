import type { ConnectedBankDTO, SpendingCategoryDTO, TransactionDTO, Result } from '@contacomigo/contrato';

// Porta da web para a origem do dado (HT-017). Hoje a implementacao e falsa
// (massa dos mocks no formato do contrato); a real chama a API. Trocar uma pela
// outra nao toca componente nenhum — e isso que o teste de equivalencia prova.
export interface OrigemDeDados {
  listarTransactions(): Promise<Result<TransactionDTO[]>>;
  listarBancosConectados(): Promise<Result<ConnectedBankDTO[]>>;
  listarCategoriasDeGasto(): Promise<Result<SpendingCategoryDTO[]>>;
}
