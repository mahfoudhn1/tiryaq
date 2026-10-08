import { AppShell } from '@/components/layout/AppShell';
import { getDashboardSummary } from './api/getDashboardSummary';
import { DashboardOverview } from './components/DashboardOverview';

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <AppShell title="Dashboard">

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <DashboardOverview summary={summary} />
      </div>
    </AppShell>
  );
}
