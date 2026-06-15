import { Bell } from 'lucide-react';
import { mockUser } from '../../../data/dashboard.mock';

function formatDate(): string {
  const date = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return date.charAt(0).toUpperCase() + date.slice(1);
}

function SyncBadge({ status }: { status: typeof mockUser.openFinanceStatus }) {
  const config = {
    synced: {
      dot: 'bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)] animate-pulse',
      text: 'Open Finance sincronizado',
      containerClass: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    },
    syncing: {
      dot: 'bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)] animate-pulse',
      text: 'Sincronizando...',
      containerClass: 'bg-amber-50 border-amber-100 text-amber-700',
    },
    error: {
      dot: 'bg-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.25)]',
      text: 'Falha na sincronização',
      containerClass: 'bg-red-50 border-red-100 text-red-600',
    },
  }[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${config.containerClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.text}
    </div>
  );
}

export default function WelcomeHeader() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl md:text-[1.7rem] font-bold text-slate-800 leading-tight">
          Olá, {mockUser.firstName}!
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-medium">{formatDate()}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <SyncBadge status={mockUser.openFinanceStatus} />

        <button
          id="dashboard-notifications-btn"
          aria-label="Notificações"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
        >
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36b37e] border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
