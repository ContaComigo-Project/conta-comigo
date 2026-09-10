import { Landmark } from 'lucide-react';
import ConnectedBanksWidget from '../overview/ConnectedBanksWidget';
import { ShieldCheck, Lock, RefreshCw } from 'lucide-react';

export default function BanksPage() {
  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            <Landmark size={12} strokeWidth={2} />
            Open Finance
          </div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Bancos Conectados</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Gerencie suas conexões de Open Finance integradas à sua conta.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConnectedBanksWidget />
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <ShieldCheck size={16} strokeWidth={2} className="text-cc-green" />
              <span>Segurança Open Finance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              O ContaComigo utiliza o padrão regulamentado pelo Banco Central do Brasil (BACEN). Seus dados bancários são agregados apenas em modo leitura via conexão segura.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[0.75rem] text-slate-500">
              <Lock size={14} strokeWidth={2} className="text-slate-400" />
              <span>Credenciais cifradas com AES-256-GCM</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-medium text-emerald-800">
              <RefreshCw size={15} strokeWidth={2} className="text-emerald-600" />
              <span>Sincronização Automática</span>
            </div>
            <p>
              Você pode sincronizar as contas a qualquer momento ou revogar o consentimento a partir do painel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}