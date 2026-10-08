'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';
import { getDashboardSummary } from './api/getDashboardSummary';
import { DashboardOverview } from './components/DashboardOverview';

export default function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        {isLoading || !summary ? (
          <div className="space-y-5">
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DashboardOverview summary={summary} />
        )}
      </div>
    </AppShell>
  );
}
