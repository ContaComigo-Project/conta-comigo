import type { LancamentoDTO } from '@contacomigo/contrato';
import type { Lancamento } from '../../domain/model/lancamento';

// Traducao entidade -> transporte, na borda HTTP (HT-017). O dominio nao conhece
// o contrato; o contrato nao conhece a entidade. So este arquivo ve os dois.
//
// Categoria e instituicao ainda nao existem na entidade: a categoria chega com
// HN-005 e a instituicao com HN-002. Ate la o transporte diz isso explicitamente
// (`null` e "desconhecida"), em vez de inventar valor.
export function paraLancamentoDTO(l: Lancamento): LancamentoDTO {
  return {
    id: l.id,
    descricao: l.descricao,
    categoria: null,
    instituicao: { id: 'desconhecida', nome: 'Desconhecida' },
    valorEmCentavos: l.valorEmCentavos,
    tipo: l.valorEmCentavos < 0 ? 'debito' : 'credito',
    dataDeCompetencia: l.dataDeCompetencia.toISOString(),
  };
}
