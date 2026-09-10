import { DashboardSummary } from "@/types/medical";
import { getDashboardSummary as fetchDashboardSummary } from "@/services/studyService";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchDashboardSummary();
}
