import { useState } from 'react';
import { Settings, User, Bell, Shield, ShieldCheck } from 'lucide-react';
import { useProfile } from '../../../data/use-profile';
import ProfileCard from './components/ProfileCard';
import SecurityCard from './components/SecurityCard';
import PreferencesCard from './components/PreferencesCard';
import PrivacyAndDataCard from './components/PrivacyAndDataCard';

const SECOES = [
  { id: 'perfil', label: 'Perfil', Icon: User },
  { id: 'alertas', label: 'Alertas', Icon: Bell },
  { id: 'seguranca', label: 'Segurança', Icon: Shield },
  { id: 'privacidade', label: 'Privacidade e Dados', Icon: ShieldCheck },
] as const;

type SecaoId = (typeof SECOES)[number]['id'];

export default function SettingsPage() {
  const perfil = useProfile();
  const [secao, setSecao] = useState<SecaoId>('perfil');

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
            Gerencie seus dados pessoais, alertas, segurança e privacidade.
          </p>
        </div>
      </header>

      <nav
        aria-label="Seções de configurações"
        className="flex flex-wrap gap-1.5 rounded-2xl p-1.5 bg-white border border-slate-100 shadow-sm"
      >
        {SECOES.map(({ id, label, Icon }) => {
          const ativa = secao === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSecao(id)}
              aria-current={ativa ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[0.8rem] font-semibold transition-all cursor-pointer ${
                ativa
                  ? 'bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-sm shadow-cc-green/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </nav>

      {secao === 'perfil' && <ProfileCard perfil={perfil} />}
      {secao === 'alertas' && <PreferencesCard />}
      {secao === 'seguranca' && <SecurityCard />}
      {secao === 'privacidade' && <PrivacyAndDataCard />}
    </div>
  );
}