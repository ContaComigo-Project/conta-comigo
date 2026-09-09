import type { TransactionDTO } from '@contacomigo/contract';
import type { Transaction } from '../../domain/model/transaction';

// Traducao entidade -> transporte, na borda HTTP (HT-017). O dominio nao conhece
// o contrato; o contrato nao conhece a entidade. So este arquivo ve os dois.
//
// Categoria e instituicao ainda nao existem na entidade: a category chega com
// HN-005 e a instituicao com HN-002. Ate la o transporte diz isso explicitamente
// (`null` e "desconhecida"), em vez de inventar valor.
export function paraTransactionDTO(l: Transaction): TransactionDTO {
  // HN-004: a tela recebe a versao legivel quando ela existe, e o texto do
  // agregador viaja junto sempre que os dois diferem — RN-010 exige que o
  // original permaneca consultavel.
  const legivel = l.readableDescription ?? l.description;

  return {
    id: l.id,
    description: legivel,
    ...(legivel === l.description ? {} : { descriptionOriginal: l.description }),
    category: null,
    instituicao: { id: 'desconhecida', name: 'Desconhecida' },
    amountInCents: l.amountInCents,
    tipo: l.amountInCents < 0 ? 'debito' : 'credito',
    dueDate: l.dueDate.toISOString(),
  };
}
