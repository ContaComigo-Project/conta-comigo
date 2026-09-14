import { LayoutGrid, ShoppingBag, TrendingUp, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const DOCK_ITEMS = [
  {
    id: 'dock_overview',
    label: 'Início',
    path: '/dashboard',
    Icon: LayoutGrid,
  },
  {
    id: 'dock_expenses',
    label: 'Despesas',
    path: '/dashboard/expenses',
    Icon: ShoppingBag,
  },
  {
    id: 'dock_investments',
    label: 'Investir',
    path: '/dashboard/investimentos',
    Icon: TrendingUp,
  },
  {
    id: 'dock_settings',
    label: 'Config.',
    path: '/dashboard/configuracoes',
    Icon: Settings,
  },
];

export default function BottomDock() {
  const { pathname } = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around bg-white/80 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,27,66,0.08)] px-2 py-2"
      aria-label="Navegação inferior"
    >
      {DOCK_ITEMS.map(({ id, label, path, Icon }) => {
        const isActive = pathname === path;
        return (
          <Link
            key={id}
            to={path}
            id={`dock-${id}`}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center gap-1 flex-1 py-1 group"
          >
            <span
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#36b37e] text-white shadow-md shadow-[#36b37e]/30 scale-105'
                  : 'text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-100'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            </span>
            <span
              className={`text-[0.6rem] font-semibold transition-colors ${
                isActive ? 'text-cc-dark-green' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
