import { useEffect, useState } from 'react';
import { ApiSource } from '../../../data/api-source';
import { paraTransactions } from '../../../data/mappers';
import { CATEGORIAS } from '../../../data/presentation';
import { useMountedAnimation } from '../../../hooks/use-mounted-animation';

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
  | { estado: 'ok'; total: number; categorias: SpendingSlice[] }
  | { estado: 'erro' };

export default function SpendingChart() {
  const animate = useMountedAnimation(80);
  const [dados, setDados] = useState<Estado>({ estado: 'carregando' });

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
        const txs = paraTransactions(r.dados, new Date());
        const porCategoria = new Map<string, number>();
        for (const t of txs) {
          if (t.amount >= 0) continue;
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
        setDados({ estado: 'ok', total, categorias: slices });
      })
      .catch(() => {
        if (ativo) setDados({ estado: 'erro' });
      });
    return () => {
      ativo = false;
    };
  }, []);

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

  const { categorias, total } = dados;
  const maxValue = Math.max(...categorias.map((c) => c.value), 1);

  return (
    <section aria-label="Mapa de gastos por categoria" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Mapa de Gastos</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Categorizado pela IA</p>
        </div>
      </div>

      {categorias.length === 0 ? (
        <p className="text-[0.75rem] text-slate-400 py-6 text-center">Nenhum gasto categorizado ainda.</p>
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
              <span className="text-xs text-slate-400 font-medium">Total nos lançamentos</span>
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