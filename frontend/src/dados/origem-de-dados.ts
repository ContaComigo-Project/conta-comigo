import type { BancoConectadoDTO, CategoriaDeGastoDTO, LancamentoDTO, Resultado } from '@contacomigo/contrato';

// Porta da web para a origem do dado (HT-017). Hoje a implementacao e falsa
// (massa dos mocks no formato do contrato); a real chama a API. Trocar uma pela
// outra nao toca componente nenhum — e isso que o teste de equivalencia prova.
export interface OrigemDeDados {
  listarLancamentos(): Promise<Resultado<LancamentoDTO[]>>;
  listarBancosConectados(): Promise<Resultado<BancoConectadoDTO[]>>;
  listarCategoriasDeGasto(): Promise<Resultado<CategoriaDeGastoDTO[]>>;
}
