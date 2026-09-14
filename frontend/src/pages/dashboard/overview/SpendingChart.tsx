import { useEffect, useMemo, useState } from 'react';
import { ApiSource } from '../../../data/api-source';
import { paraTransactions } from '../../../data/mappers';
import { CATEGORIAS } from '../../../data/presentation';
import { useMountedAnimation } from '../../../hooks/use-mounted-animation';
import type { Transaction } from '../../../data/transaction';

interface SpendingSlice {
  id: string;
  name: string;
  icon: string;
  color: string;
  value: number;
  percentage: number;
}

type Estado =
  | { estado: 'carregando' }
  | { estado: 'ok' }
  | { estado: 'erro' };

const PERIODOS = [
  { id: 'mes', label: 'Este mês', meses: 1 },
  { id: '3m', label: '3 meses', meses: 3 },
  { id: '6m', label: '6 meses', meses: 6 },
  { id: '12m', label: '12 meses', meses: 12 },
] as const;

type PeriodoId = (typeof PERIODOS)[number]['id'];

/** Primeiro dia (inclusive) do período terminando no mês corrente. */
function inicioDoPeriodo(meses: number): Date {
  const agora = new Date();
  const corte = new Date(Date.UTC(agora.getFullYear(), agora.getMonth() - (meses - 1), 1));
  return corte;
}

function agregar(transacoes: Transaction[], corte: Date): { total: number; slices: SpendingSlice[] } {
  const porCategoria = new Map<string, number>();
  for (const t of transacoes) {
    if (t.amount >= 0 || t.date < corte) continue;
    const id = t.categoryId ?? 'outros';
    porCategoria.set(id, (porCategoria.get(id) ?? 0) + Math.abs(t.amount));
  }
  const total = [...porCategoria.values()].reduce((s, v) => s + v, 0);
  const slices = [...porCategoria.entries()]
    .map(([id, value]) => {
      const v = CATEGORIAS[id] ?? CATEGORIAS.outros;
      return {
        id,
        name: v.name,
        icon: v.iconeNoGrafico,
        color: v.cor,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  return { total, slices };
}

export default function SpendingChart() {
  const animate = useMountedAnimation(80);
  const [dados, setDados] = useState<Estado>({ estado: 'carregando' });
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [periodo, setPeriodo] = useState<PeriodoId>('mes');

  useEffect(() => {
    let ativo = true;
    void new ApiSource()
      .listarTransactions()
      .then((r) => {
        if (!ativo) return;
        if (r.estado !== 'ok') {
          setDados({ estado: 'erro' });
          return;
        }
        setTransacoes(paraTransactions(r.dados, new Date()));
        setDados({ estado: 'ok' });
      })
      .catch(() => {
        if (ativo) setDados({ estado: 'erro' });
      });
    return () => {
      ativo = false;
    };
  }, []);

  const selecionado = PERIODOS.find((p) => p.id === periodo) ?? PERIODOS[0];
  const { total, slices: categorias } = useMemo(() => agregar(transacoes, inicioDoPeriodo(selecionado.meses)), [transacoes, selecionado.meses]);

  if (dados.estado !== 'ok') {
    return (
      <section aria-label="Mapa de gastos por categoria" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800">Mapa de Gastos</h2>
        <p className="text-[0.72rem] text-slate-400 mt-1">
          {dados.estado === 'carregando' ? 'Carregando...' : 'Não foi possível carregar os gastos agora.'}
        </p>
      </section>
    );
  }

  const maxValue = Math.max(...categorias.map((c) => c.value), 1);

  return (
    <section aria-label="Mapa de gastos por categoria" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-sm font-bold text-slate-800">Mapa de Gastos</h2>
        <div className="flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 p-0.5">
          {PERIODOS.map((p) => {
            const ativo = periodo === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodo(p.id)}
                className={`px-2.5 py-1 rounded-md text-[0.68rem] font-semibold transition-all cursor-pointer ${
                  ativo ? 'bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {categorias.length === 0 ? (
        <p className="text-[0.75rem] text-slate-400 py-6 text-center">Nenhum gasto no período selecionado.</p>
      ) : (
        <>
          <div className="flex items-end gap-1.5 px-1">
            {categorias.map((category) => {
              const heightPercent = (category.value / maxValue) * 100;
              return (
                <div key={category.id} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[0.65rem] font-bold text-slate-600 text-center whitespace-nowrap">
                    R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>

                  <div className="relative w-full h-32 flex items-end justify-center">
                    <div
                      className="w-full rounded-t-lg transition-all duration-700 ease-out"
                      style={{
                        height: animate ? `${heightPercent}%` : '0%',
                        backgroundColor: category.color,
                        minHeight: animate ? '8px' : '0px',
                        boxShadow: animate ? `0 -2px 8px ${category.color}40` : 'none',
                      }}
                    />
                  </div>

                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <i className={`fas ${category.icon}`} style={{ color: category.color }} />
                  </div>

                  <span className="text-[0.62rem] font-medium text-slate-400 text-center leading-tight max-w-12">
                    {category.name.length > 8 ? category.name.slice(0, 7) + '.' : category.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            {categorias.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-slate-500 flex-1 truncate">{cat.name}</span>
                <span className="text-xs font-semibold text-slate-700">{cat.percentage.toFixed(0)}%</span>
              </div>
            ))}
            <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between">
              <span className="text-xs text-slate-400 font-medium">Total no período ({selecionado.label.toLowerCase()})</span>
              <span className="text-xs font-bold text-slate-800">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}