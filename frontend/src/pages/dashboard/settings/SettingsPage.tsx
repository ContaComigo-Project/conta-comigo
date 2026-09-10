import { Link } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { useProfile } from '../../../data/use-profile';
import ProfileCard from './components/ProfileCard';
import SecurityCard from './components/SecurityCard';
import PreferencesCard from './components/PreferencesCard';
import PrivacyAndDataCard from './components/PrivacyAndDataCard';

export default function SettingsPage() {
  const perfil = useProfile();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#36b37e]/10 text-[#36b37e] flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001b42]">Configurações</h1>
            <p className="text-sm text-slate-500">
              Gerencie seus dados pessoais, segurança e preferências de conta
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

      {/* Settings cards stack */}
      <div className="space-y-6">
        <ProfileCard perfil={perfil} />
        <PreferencesCard />
        <SecurityCard />
        <PrivacyAndDataCard />
      </div>
    </div>
  );
}
