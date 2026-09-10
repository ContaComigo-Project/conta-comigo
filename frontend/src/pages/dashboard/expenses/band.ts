import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Band } from '../../../data/band';

// Presentation only. The band decision comes ready from the backend (RN-001);
// this map holds no threshold — just color/icon/label for the screen.
export type { Band };

export interface BandMeta {
  label: string;
  Icon: LucideIcon;
  barClass: string;
  badgeClass: string;
  ringClass: string;
  softBg: string;
  textClass: string;
  dotClass: string;
}

export const BAND_META: Record<Band, BandMeta> = {
  green: {
    label: 'Dentro do limite',
    Icon: CheckCircle2,
    barClass: 'bg-linear-to-t from-emerald-600 to-emerald-400',
    badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    ringClass: 'ring-emerald-200',
    softBg: 'bg-emerald-50',
    textClass: 'text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  amber: {
    label: 'Atenção',
    Icon: AlertTriangle,
    barClass: 'bg-linear-to-t from-amber-500 to-amber-300',
    badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200',
    ringClass: 'ring-amber-200',
    softBg: 'bg-amber-50',
    textClass: 'text-amber-600',
    dotClass: 'bg-amber-400',
  },
  red: {
    label: 'Estourado',
    Icon: XCircle,
    barClass: 'bg-linear-to-t from-red-600 to-red-400',
    badgeClass: 'text-red-700 bg-red-50 border border-red-200',
    ringClass: 'ring-red-200',
    softBg: 'bg-red-50',
    textClass: 'text-red-600',
    dotClass: 'bg-red-500',
  },
  'no-limit': {
    label: 'Sem limite',
    Icon: MinusCircle,
    barClass: 'bg-linear-to-t from-slate-300 to-slate-200',
    badgeClass: 'text-slate-600 bg-slate-50 border border-slate-200',
    ringClass: 'ring-slate-200',
    softBg: 'bg-slate-50',
    textClass: 'text-slate-500',
    dotClass: 'bg-slate-300',
  },
};

/** Bands used in filters/sorting — no-limit stays out of the highlights. */
export const FILTER_BANDS: readonly Band[] = ['green', 'amber', 'red'];

/** Overall month band from per-category counts (visual aggregation, no threshold). */
export function bandFromCounts(counts: Record<Band, number>): Band {
  if (counts.red > 0) return 'red';
  if (counts.amber > 0) return 'amber';
  if (counts['no-limit'] > 0) return 'no-limit';
  return 'green';
}

