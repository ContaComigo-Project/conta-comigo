import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, KeyRound, LogOut, Check, Loader2 } from 'lucide-react';
import { signOut } from '../../../../data/access';

export default function SecurityCard() {
  const navigate = useNavigate();
  const [encerrando, setEncerrando] = useState(false);

  const handleSignOut = async () => {
    setEncerrando(true);
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Segurança e Sessão</h2>
            <p className="text-xs text-slate-500">Parâmetros de proteção criptográfica e controle de acesso</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Token de Acesso em Memória</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              O Access Token viaja exclusivamente na memória do navegador, protegido contra ataques de XSS e extrações indevidas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sessão Persistente Segura</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sua sessão permanece ativa ao recarregar a página, com proteção invisível a scripts maliciosos.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Criptografia em Repouso</p>
              <p className="text-xs text-slate-500">Credenciais e tokens do Open Finance são cifrados antes de gravar no banco.</p>
            </div>
          </div>
        </div>

        {/* Action: Encerramento de sessão */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={encerrando}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs disabled:opacity-50"
          >
            {encerrando ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Encerrar Sessão Desta Máquina</span>
          </button>
        </div>
      </div>
    </div>
  );
}
