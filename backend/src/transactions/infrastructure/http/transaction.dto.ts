import type { TransactionDTO } from '@contacomigo/contract';
import type { Transaction } from '../../domain/model/transaction';

// Nome de exibicao da categoria. Vive na borda porque e apresentacao: o
// dominio guarda o identificador (HN-005), nao o rotulo.
const NOMES_DE_CATEGORIA: Record<string, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  moradia: 'Moradia',
  saude: 'Saúde',
  lazer: 'Lazer',
  receita: 'Receita',
  investimentos: 'Investimentos',
  outros: 'Outros',
};

// Traducao entidade -> transporte, na borda HTTP (HT-017). O dominio nao conhece
// o contrato; o contrato nao conhece a entidade. So este arquivo ve os dois.
//
// A instituicao ainda nao existe na entidade; ate ela chegar, o transporte diz
// isso explicitamente ("desconhecida") em vez de inventar valor. A categoria
// chegou com HN-005: `null` aqui significa "nao classificado" (RF-011), e nao
// ausencia de suporte.
export function paraTransactionDTO(l: Transaction): TransactionDTO {
  // HN-004: a tela recebe a versao legivel quando ela existe, e o texto do
  // agregador viaja junto sempre que os dois diferem — RN-010 exige que o
  // original permaneca consultavel.
  const legivel = l.readableDescription ?? l.description;

  return {
    id: l.id,
    description: legivel,
    ...(legivel === l.description ? {} : { descriptionOriginal: l.description }),
    category: l.category ? { id: l.category, name: NOMES_DE_CATEGORIA[l.category] } : null,
    instituicao: { id: 'desconhecida', name: 'Desconhecida' },
    amountInCents: l.amountInCents,
    tipo: l.amountInCents < 0 ? 'debito' : 'credito',
    dueDate: l.dueDate.toISOString(),
  };
}
