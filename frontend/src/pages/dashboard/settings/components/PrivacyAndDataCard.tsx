import { useState } from 'react';
import { Shield, Trash2, Database, Clock } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';

export default function PrivacyAndDataCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#001b42]">Privacidade e Dados (LGPD)</h2>
              <p className="text-xs text-slate-500">Transparência no armazenamento e soberania sobre seus dados financeiros</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>Consentimento Ativo (RN-012)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seus dados de contas e lançamentos só são agregados enquanto existir um consentimento válido e autorizado por você.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Expiração e Revogação (RN-013)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ao revogar uma conexão bancária, a instituição é removida do painel imediatamente e a exclusão definitiva ocorre em até 24h.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Zona de Risco: Excluir Conta
              </h3>
              <p className="text-xs text-rose-700/80 leading-relaxed max-w-lg">
                Apaga permanentemente seu usuário, histórico de transações, limites orçamentários e revoga todos os consentimentos bancários vinculados.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Minha Conta</span>
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
