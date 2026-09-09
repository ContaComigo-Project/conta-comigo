import { Bell } from 'lucide-react';
import { useProfile } from '../../../data/use-profile';

function formatDate(): string {
  const date = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return date.charAt(0).toUpperCase() + date.slice(1);
}

export default function WelcomeHeader() {
  const perfil = useProfile();

  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl md:text-[1.7rem] font-bold text-slate-800 leading-tight">
          Olá, {perfil.firstName}!
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-medium">{formatDate()}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          id="dashboard-notifications-btn"
          aria-label="Notificações"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
        >
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36b37e] border-2 border-white" />
        </button>
      </div>
    </header>
  );
}