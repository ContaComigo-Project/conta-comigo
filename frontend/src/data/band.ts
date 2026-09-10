// Tradução da faixa do contrato (RN-001, pt-BR) para o id de apresentação (en)
// usado nas telas. Vive no data layer porque é a fronteira contrato → UI.
export type Band = 'green' | 'amber' | 'red' | 'no-limit';

const BAND_DO_BACKEND: Record<string, Band> = {
  verde: 'green',
  amarela: 'amber',
  vermelha: 'red',
  'sem-limite': 'no-limit',
};

/** Traduz a faixa do contrato (pt) para o id de apresentação (en). */
export function bandFromBackend(band: string): Band {
  return BAND_DO_BACKEND[band] ?? 'no-limit';
}