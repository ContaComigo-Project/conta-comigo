import { User, Mail, CheckCircle2, Shield } from 'lucide-react';
import type { PerfilExibido } from '../../../../data/use-profile';

interface ProfileCardProps {
  perfil: PerfilExibido;
}

export default function ProfileCard({ perfil }: ProfileCardProps) {
  return (
    <div className="bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-cc-green flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Perfil do Titular</h2>
            <p className="text-xs text-slate-500">Informações da sua conta cadastrada na plataforma</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Conta Ativa
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
          {perfil.iniciais}
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">{perfil.nome}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{perfil.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <Shield className="w-3.5 h-3.5 text-cc-green" />
            <span>Titular individual autenticado via JWT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
