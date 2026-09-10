import { useState } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { loadUserPreferences, saveUserPreferences, type UserPreferences } from '../../../../data/settings';

export default function PreferencesCard() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadUserPreferences());

  const handleToggle = (key: keyof UserPreferences) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveUserPreferences(next);
      return next;
    });
  };

  return (
    <div className="bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-cc-green flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Alertas e Preferências</h2>
            <p className="text-xs text-slate-500">Configure como o ContaComigo sinaliza seu progresso orçamentário</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Toggle 1: Faixa Amarela 70% */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <p className="text-xs font-semibold text-slate-800">Aviso de Faixa Amarela (70%)</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Alerta no semáforo quando os gastos de uma categoria cruzam 70% do limite mensal estipulado.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('alertYellowBand')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              prefs.alertYellowBand ? 'bg-cc-green' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                prefs.alertYellowBand ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Faixa Vermelha 90% */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <p className="text-xs font-semibold text-slate-800">Aviso Crítico de Faixa Vermelha (90%)</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Alerta de atenção máxima quando a categoria atinge 90% ou estoura o limite definido.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('alertRedBand')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              prefs.alertRedBand ? 'bg-cc-green' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                prefs.alertRedBand ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Notificação de Sincronização */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-800">Avisos de Sincronização de Contas</p>
            <p className="text-xs text-slate-500 mt-1">
              Exibe confirmações quando o conector Open Finance atualiza novos lançamentos e saldos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('syncNotifications')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              prefs.syncNotifications ? 'bg-cc-green' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                prefs.syncNotifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Teto de IA Info */}
        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-cc-green flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900">Teto Diário do Assistente IA (RNF-009)</p>
              <p className="text-[0.72rem] text-emerald-700 leading-relaxed">
                Cada titular possui uma cota diária garantida de 20 interações com a IA, otimizadas com cache semântico.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
            20 / dia
          </span>
        </div>
      </div>
    </div>
  );
}
