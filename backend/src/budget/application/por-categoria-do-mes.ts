import { mesDeReferencia } from '../../transactions/domain/reference-month';
import { faixaDoSemaforo, type Faixa } from '../domain/budget-band';
import type { LimiteMensal } from '../domain/model/monthly-limit';
import type { Transaction } from '../../transactions/domain/model/transaction';

// Gasto por categoria no mês de referência (RN-003) + faixa exata (RN-001).
// Compartilhado entre o semáforo e o histórico para a regra nunca divergir.
export interface CategoriaCalculada {
  readonly category: string;
  readonly limitInCents: number | null;
  readonly spentInCents: number;
  readonly band: Faixa;
}

export function categoriasDoMes(
  limites: readonly LimiteMensal[],
  transacoes: readonly Transaction[],
  month: string,
): readonly CategoriaCalculada[] {
  const gastos = new Map<string, number>();
  for (const t of transacoes) {
    if (!t.category) continue; // "não classificado" não entra
    if (t.amountInCents >= 0) continue; // receita não é gasto (RN-003)
    const m = mesDeReferencia(t.dueDate);
    if (`${m.ano}-${String(m.mes).padStart(2, '0')}` !== month) continue;
    gastos.set(t.category, (gastos.get(t.category) ?? 0) + Math.abs(t.amountInCents));
  }

  const categorias: CategoriaCalculada[] = limites.map((l) => {
    const spent = gastos.get(l.category) ?? 0;
    return {
      category: l.category,
      limitInCents: l.limitInCents,
      spentInCents: spent,
      band: faixaDoSemaforo(spent, l.limitInCents),
    };
  });

  // RN-002: categorias gastas sem limite entram como "sem-limite".
  for (const [cat, spent] of gastos) {
    if (!limites.some((l) => l.category === cat)) {
      categorias.push({ category: cat, limitInCents: null, spentInCents: spent, band: 'sem-limite' });
    }
  }

  return categorias;
}