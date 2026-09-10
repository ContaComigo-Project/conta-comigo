import { Sparkles, ShieldAlert, CheckCircle2, Lightbulb } from 'lucide-react';

export default function AIDiversificationCard() {
  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/30 border border-slate-100/80 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cc-green/10 text-cc-green flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Diagnóstico Educativo de Diversificação</h2>
            <p className="text-xs text-slate-500">Visão pedagógica da distribuição do seu patrimônio</p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Perfil Equilibrado
        </span>
      </div>

      {/* Observations */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-slate-100 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-slate-700 leading-relaxed">
            <strong className="font-semibold text-slate-900">Reserva e Liquidez:</strong> Cerca de 35% da sua carteira está em ativos com liquidez diária (Tesouro Selic e Poupança), garantindo cobertura sólida para imprevistos.
          </p>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-slate-100 text-xs">
          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-slate-700 leading-relaxed">
            <strong className="font-semibold text-slate-900">Proteção contra Inflação:</strong> Ativos atrelados ao IPCA (como o Tesouro IPCA+) e FIIs protegem o poder de compra real no longo prazo.
          </p>
        </div>
      </div>

      {/* Mandatory Non-Advice Disclaimer (RN-017) */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Aviso Regulatório de Educação Financeira (RN-017)</span>
        </div>
        <p className="text-[0.72rem] leading-relaxed text-amber-950/80">
          O ContaComigo é uma plataforma de consolidação orçamentária e financeira para fins exclusivamente educativos. Não fornecemos aconselhamento financeiro, análise de títulos, intermediação ou recomendação de investimentos regulamentada pela CVM ou Banco Central do Brasil.
        </p>
      </div>
    </div>
  );
}
