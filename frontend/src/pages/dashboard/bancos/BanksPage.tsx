import { Link } from 'react-router-dom';
import { ArrowLeft, Landmark, ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import ConnectedBanksWidget from '../overview/ConnectedBanksWidget';

export default function BanksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#36b37e]/10 text-[#36b37e] flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001b42]">Bancos Conectados</h1>
            <p className="text-sm text-slate-500">
              Gerencie suas conexões de Open Finance integradas à sua conta
            </p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
      </div>

      {/* Grid: Widget + Compliance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConnectedBanksWidget />
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#001b42] font-semibold text-sm">
              <ShieldCheck className="w-5 h-5 text-[#36b37e]" />
              <span>Segurança Open Finance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              O ContaComigo utiliza o padrão regulamentado pelo Banco Central do Brasil (BACEN). Seus dados bancários são agregados apenas em modo leitura via conexão segura.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[0.75rem] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Credenciais cifradas com AES-256-GCM</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-medium text-emerald-800">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
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
