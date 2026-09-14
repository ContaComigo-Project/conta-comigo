// Presentation shape of a transaction consumed by the screens (mapped from the
// contract DTO in mappers.ts). Lives here so no page imports from the mocks.
export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  /** Readable version (HN-004). The aggregator raw text stays in `descriptionOriginal`. */
  description: string;
  /** Raw aggregator text, when it differs from the readable one (RN-010). */
  descriptionOriginal?: string;
  merchant?: string;
  category: string;
  /** Id of the domain catalog (HN-005); `null` = unclassified. */
  categoryId?: string | null;
  categoryIcon: string;
  bank: string;
  bankColor: string;
  amount: number;
  type: TransactionType;
  formattedAmount: string;
  date: Date;
  formattedDate: string;
}