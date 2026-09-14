import WelcomeHeader from './WelcomeHeader';
import MetricsCards from './MetricsCards';
import AIInsightPanel from './AIInsightPanel';
import SpendingChart from './SpendingChart';
import BudgetAtAGlance from './BudgetAtAGlance';
import RecentActivity from './RecentActivity';
import ConnectedBanksWidget from './ConnectedBanksWidget';

export default function Overview() {
  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <WelcomeHeader />
      <MetricsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightPanel />
        <SpendingChart />
      </div>

      <BudgetAtAGlance />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <RecentActivity />
        <ConnectedBanksWidget />
      </div>
    </div>
  );
}
