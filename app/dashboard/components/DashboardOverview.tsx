import { DashboardSummary } from "@/types/medical";
import { ActivityFeed } from "./ActivityFeed";
import { DashboardStats } from "./DashboardStats";
import { StudySuites } from "./StudySuites";
import { WelcomePanel } from "./WelcomePanel";

interface DashboardOverviewProps {
  summary: DashboardSummary;
}

export function DashboardOverview({ summary }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <WelcomePanel summary={summary} />
      <DashboardStats summary={summary} />
      <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
        <StudySuites summary={summary} />
        <ActivityFeed activities={summary.recentActivity} />
      </div>
    </div>
  );
}
