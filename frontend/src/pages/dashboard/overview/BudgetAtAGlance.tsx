import { ArrowRight, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiSource, mesCorrente } from '../../../data/api-source';
import { formatBRL } from '../../../utils/formatters';
import { useMountedAnimation } from '../../../hooks/use-mounted-animation';

// Apresentação apenas: cores/ícones por faixa. A decisão de faixa vem pronta do
// backend (RN-001) — este mapa não contém limiar nenhum.
const META_BAND = {
  verde: { Icon: ShieldCheck, label: 'Dentro do limite', badgeClass: 'bg-emerald-100 text-emerald-700', barClass: 'bg-linear-to-t from-cc-dark-green to-cc-green' },
  amarela: { Icon: ShieldAlert, label: 'Atenção', badgeClass: 'bg-amber-100 text-amber-700', barClass: 'bg-linear-to-t from-amber-500 to-amber-400' },
  vermelha: { Icon: ShieldX, label: 'Estourou', badgeClass: 'bg-red-100 text-red-700', barClass: 'bg-linear-to-t from-red-600 to-red-400' },
  'sem-limite': { Icon: ShieldCheck, label: 'Sem limite', badgeClass: 'bg-slate-100 text-slate-600', barClass: 'bg-linear-to-t from-slate-300 to-slate-200' },
} as const;

type Band = keyof typeof META_BAND;

const MESES_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function nomeDoMes(month: string): string {
  const [ano, mes] = month.split('-').map(Number);
  return `${MESES_PT[mes - 1]} ${ano}`;
}

type Estado =
  | { estado: 'carregando' }
  | { estado: 'ok'; month: string; categorias: Array<{ category: string; limitInCents: number | null; spentInCents: number; band: Band }> }
  | { estado: 'erro' };

export default function BudgetAtAGlance() {
  const animate = useMountedAnimation(140);
  const [dados, setDados] = useState<Estado>({ estado: 'carregando' });

  useEffect(() => {
    let ativo = true;
    void new ApiSource()
      .semaphoreDoMes(mesCorrente())
      .then((r) => {
        if (!ativo) return;
        setDados({
          estado: 'ok',
          month: r.month,
          categorias: r.categorias.map((c) => ({
            category: c.category,
            limitInCents: c.limitInCents,
            spentInCents: c.spentInCents,
            band: c.band as Band,
          })),
        });
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
      <section aria-label="Orçamento em resumo" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800">Orçamento</h2>
        <p className="text-[0.72rem] text-slate-400 mt-2">
          {dados.estado === 'carregando' ? 'Carregando o semáforo do mês...' : 'Não foi possível carregar o orçamento agora.'}
        </p>
      </section>
    );
  }

  const { categorias } = dados;
  const comLimite = categorias.filter((c) => c.limitInCents !== null);
  const totalSpent = comLimite.reduce((s, c) => s + c.spentInCents, 0);
  const totalLimit = comLimite.reduce((s, c) => s + (c.limitInCents ?? 0), 0);
  const pct = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const counts = categorias.reduce(
    (acc, c) => ({ ...acc, [c.band]: acc[c.band] + 1 }),
    { verde: 0, amarela: 0, vermelha: 0, 'sem-limite': 0 } as Record<Band, number>,
  );

  const alerts = categorias
    .filter((c) => c.band !== 'verde' && c.band !== 'sem-limite')
    .sort((a, b) => percentual(b) - percentual(a))
    .slice(0, 2);

  function percentual(c: { spentInCents: number; limitInCents: number | null }): number {
    return c.limitInCents ? (c.spentInCents / c.limitInCents) * 100 : 0;
  }

  return (
    <section aria-label="Orçamento em resumo" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Orçamento · {nomeDoMes(dados.month)}</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">Acompanhe o quanto do seu limite foi utilizado</p>
        </div>
        <Link
          to="/dashboard/expenses"
          className="text-[0.75rem] font-semibold text-cc-green hover:text-cc-dark-green hover:underline underline-offset-2 transition-colors flex items-center gap-1"
        >
          Ajustar limites
          <ArrowRight size={13} strokeWidth={2.2} />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4 p-3 rounded-xl bg-linear-to-br from-slate-50 to-white border border-slate-100">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[0.65rem] text-slate-400">Total consolidado</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold text-slate-400">R$</span>
            <span className="text-xl font-bold text-slate-800 tabular-nums">{formatBRL(totalSpent)}</span>
            <span className="text-xs text-slate-400 tabular-nums">de R$ {formatBRL(totalLimit)}</span>
            <span className="ml-1 text-[0.7rem] font-semibold text-slate-500 tabular-nums">({pct.toFixed(0)}%)</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 shrink-0">
          {(['verde', 'amarela', 'vermelha'] as Band[]).map((s) => {
            const m = META_BAND[s];
            return (
              <div key={s} className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-white border border-slate-100">
                <m.Icon size={12} strokeWidth={2.4} className={m.badgeClass.split(' ')[0]} />
                <span className="text-[0.75rem] font-bold text-slate-800 leading-none mt-0.5 tabular-nums">{counts[s]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 mb-4">
        {categorias.map((c) => {
          const fillPct = Math.min(100, percentual(c));
          const meta = META_BAND[c.band];
          return (
            <div key={c.category} className="flex flex-col items-center gap-1.5">
              <div className="relative w-full h-24 rounded-lg bg-slate-50 overflow-hidden flex items-end border border-slate-100">
                <div className="absolute left-0 right-0 top-[30%] h-px border-t border-dashed border-amber-200 z-1" />
                <div className="absolute left-0 right-0 top-[10%] h-px border-t border-dashed border-red-200 z-1" />
                <div
                  className={`w-full ${meta.barClass} transition-all duration-1200 ease-out rounded-t-sm`}
                  style={{ height: animate ? `${fillPct}%` : '0%' }}
                />
              </div>
              <div className="text-[0.6rem] font-semibold text-slate-500 leading-tight text-center max-w-14 truncate w-full">
                {c.category}
              </div>
              <div className={`text-[0.6rem] font-bold tabular-nums leading-none ${meta.badgeClass.split(' ')[0]}`}>
                {percentual(c).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">Categorias de atenção</p>
          {alerts.map((a) => {
            const m = META_BAND[a.band];
            return (
              <div key={a.category} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-7 h-7 rounded-md flex items-center justify-center ${m.badgeClass}`}>
                    <m.Icon size={13} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.75rem] font-bold text-slate-800 leading-tight">{a.category}</p>
                    <p className="text-[0.65rem] text-slate-500 leading-tight tabular-nums">
                      R$ {formatBRL(a.spentInCents)} de R$ {formatBRL(a.limitInCents ?? 0)}
                    </p>
                  </div>
                </div>
                <span className={`text-[0.7rem] font-bold tabular-nums px-2 py-0.5 rounded-full ${m.badgeClass}`}>
                  {percentual(a).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}