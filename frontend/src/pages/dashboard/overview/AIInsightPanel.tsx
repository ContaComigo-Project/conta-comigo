import { useEffect, useState } from 'react';
import { Bot, Info, AlertTriangle } from 'lucide-react';
import { ApiSource } from '../../../data/api-source';

type EstadoDoDiagnostico =
  | { estado: 'carregando' }
  | { estado: 'ok'; texto: string; contingencia?: boolean; contingenciaDetalhe?: string }
  | { estado: 'dados-insuficientes' }
  | { estado: 'degradado'; motivo: string };

const MENSAGEM_DADOS_INSUFICIENTES =
  'Ainda não há um mês fechado com lançamentos para gerar o diagnóstico. Conecte sua conta e acompanhe um ciclo mensal.';

export default function AIInsightPanel() {
  const [dados, setDados] = useState<EstadoDoDiagnostico>({ estado: 'carregando' });

  useEffect(() => {
    let ativo = true;
    void new ApiSource()
      .diagnostico()
      .then((r) => {
        if (!ativo) return;
        if (r.estado === 'ok') setDados({ estado: 'ok', texto: r.texto ?? '', contingencia: r.contingencia, contingenciaDetalhe: r.contingenciaDetalhe });
        else if (r.estado === 'dados-insuficientes') setDados({ estado: 'dados-insuficientes' });
        else setDados({ estado: 'degradado', motivo: r.estado });
      })
      .catch(() => {
        if (ativo) setDados({ estado: 'degradado', motivo: 'erro' });
      });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section aria-label="Diagnóstico de IA">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center text-white">
            <Bot size={13} strokeWidth={1.8} />
          </span>
          Diagnóstico de IA
        </h2>
      </div>

      <div className="rounded-2xl border-2 border-cc-green/30 p-5 bg-white shadow-[0_4px_24px_rgba(54,179,126,0.08)]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center text-white shadow-sm shadow-cc-green/30 shrink-0">
            <Bot size={20} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              Consultor de IA
            </p>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              {dados.estado === 'ok' ? 'Saúde financeira do seu orçamento' : dados.estado === 'dados-insuficientes' ? 'Aguardando dados' : 'Diagnóstico indisponível'}
            </h3>
          </div>
        </div>

        {dados.estado === 'carregando' && (
          <p className="text-sm text-slate-400 animate-pulse">Gerando diagnóstico a partir dos seus números...</p>
        )}

        {dados.estado === 'ok' && (
          <>
            {dados.contingencia && (
              <p className="text-[0.7rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                A IA educativa está em modo de contingência: o provedor está indisponível no momento
                {dados.contingenciaDetalhe ? ` (${dados.contingenciaDetalhe})` : ''}. O texto abaixo é educativo e genérico.
              </p>
            )}
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{dados.texto}</p>
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-emerald-100 bg-emerald-50/50 text-[0.68rem] text-emerald-700 leading-relaxed">
              <Info size={12} strokeWidth={2.2} className="shrink-0 mt-0.5" />
              <span>
                Este diagnóstico é educativo e usa seus números, mas não é aconselhamento financeiro.
                Não recomenda produtos, investimentos, crédito ou instituições.
              </span>
            </div>
          </>
        )}

        {dados.estado === 'dados-insuficientes' && (
          <p className="text-sm text-slate-600 leading-relaxed">{MENSAGEM_DADOS_INSUFICIENTES}</p>
        )}

        {dados.estado === 'degradado' && (
          <p className="text-sm text-slate-500 leading-relaxed flex items-start gap-2">
            <AlertTriangle size={15} strokeWidth={2} className="shrink-0 mt-0.5 text-amber-500" />
            O diagnóstico não está disponível no momento (estado: {dados.motivo}). Seus números continuam visíveis no painel.
          </p>
        )}
      </div>
    </section>
  );
}