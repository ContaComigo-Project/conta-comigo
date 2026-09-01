import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, TrendingUp, Landmark, Settings, ChevronRight } from 'lucide-react';
import { mockUser } from '../../../mocks';

const NAV_ITEMS = [
  { id: 'nav_overview',     label: 'Visão Geral',       Icon: LayoutGrid,  path: '/dashboard' },
  { id: 'nav_expenses',     label: 'Despesas',           Icon: ShoppingBag, path: '/dashboard/expenses' },
  { id: 'nav_investments',  label: 'Investimentos',      Icon: TrendingUp,  path: '/dashboard/investimentos' },
  { id: 'nav_banks',        label: 'Bancos Conectados',  Icon: Landmark,    path: '/dashboard/bancos' },
  { id: 'nav_settings',     label: 'Configurações',      Icon: Settings,    path: '/dashboard/configuracoes' },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className="hidden md:flex flex-col w-55 min-h-screen shrink-0 bg-white border-r border-slate-100 shadow-[2px_0_24px_0_rgba(0,27,66,0.04)] fixed left-0 top-0 z-30"
      aria-label="Navegação principal"
    >
      <div className="px-6 py-7 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5" aria-label="ContaComigo — Início">
          <img
            src="/assets/brand/icone-conta-comigo.png"
            alt="Ícone ContaComigo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-[1.05rem] leading-tight">
            <span className="text-[#36b37e]">Conta</span>
            <span className="text-[#001b42]">Comigo</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 flex flex-col gap-1" aria-label="Menu do painel">
        <p className="px-3 mb-3 text-[0.68rem] font-semibold text-slate-400 uppercase tracking-widest">
          Menu
        </p>

        {NAV_ITEMS.map(({ id, label, Icon, path }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={id}
              to={path}
              id={`sidebar-${id}`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive ? 'bg-cc-green/10 text-cc-dark-green' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#36b37e] text-white shadow-sm shadow-[#36b37e]/40'
                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>
              {label}
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#36b37e]" />}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)] animate-pulse shrink-0" />
        <span className="text-[0.72rem] font-medium text-emerald-700 leading-tight">
          Open Finance sincronizado
        </span>
      </div>

      <div className="px-3 pb-6 border-t border-slate-100 pt-4">
        <button
          id="sidebar-user-menu"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
          aria-label="Menu do usuário"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
            style={{ backgroundColor: mockUser.avatarColor }}
          >
            {mockUser.avatarInitials}
          </div>

          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold text-slate-800 leading-tight truncate max-w-27.5">
              {mockUser.name}
            </span>
            <span className="text-[0.7rem] text-slate-400 truncate max-w-27.5">
              {mockUser.email}
            </span>
          </div>

          <ChevronRight size={15} strokeWidth={2} className="text-slate-300 ml-auto group-hover:text-slate-500 transition-colors shrink-0" />
        </button>
      </div>
    </aside>
  );
}
