import { Settings } from 'lucide-react';
import { useProfile } from '../../../data/use-profile';
import ProfileCard from './components/ProfileCard';
import SecurityCard from './components/SecurityCard';
import PreferencesCard from './components/PreferencesCard';
import PrivacyAndDataCard from './components/PrivacyAndDataCard';

export default function SettingsPage() {
  const perfil = useProfile();

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[0.7rem] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            <Settings size={12} strokeWidth={2} />
            Conta
          </div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Configurações</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Gerencie seus dados pessoais, segurança e preferências de conta.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        <ProfileCard perfil={perfil} />
        <PreferencesCard />
        <SecurityCard />
        <PrivacyAndDataCard />
      </div>
    </div>
  );
}