import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomDock from './components/BottomDock';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main
        className="flex-1 min-h-screen md:ml-[220px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-8 overflow-y-auto"
        id="dashboard-main-content"
        aria-label="Conteúdo do painel"
      >
        <Outlet />
      </main>

      <BottomDock />
    </div>
  );
}
