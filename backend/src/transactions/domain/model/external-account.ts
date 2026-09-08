import type { HolderId } from './holder';

// External account persisted for the consolidated panel (HN-003). The type
// separates active accounts (checking/savings) from credit cards: the card
// enters the panel as a bill, never summed into the balance (RN-009).

export type TipoDeAccountExterna = 'corrente' | 'poupanca' | 'cartao-de-credito';

export interface ExternalAccount {
  readonly id: string;
  readonly holderId: HolderId;
  /** Identifier the aggregator gave to this account (RN-008 dedup). */
  readonly externalId: string;
  readonly institutionId: string;
  readonly type: TipoDeAccountExterna;
  /** Balance in cents (RN-006). For a card, a negative balance is the bill. */
  readonly balanceInCents: number;
}

/** RN-009: checking and savings are active accounts; a card is not. */
export const eContaAtiva = (tipo: TipoDeAccountExterna): boolean =>
  tipo === 'corrente' || tipo === 'poupanca';