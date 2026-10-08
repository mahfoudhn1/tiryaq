'use client';

import { Activity, BrainCircuit, ClipboardCheck, Stethoscope } from "lucide-react";
import { DashboardSummary } from "@/types/medical";
import { useLocale } from '@/lib/i18n/useLocale';

const activityIcon = { flashcard: BrainCircuit, case: Stethoscope, quiz: ClipboardCheck };

export function ActivityFeed({ activities }: { activities: DashboardSummary["recentActivity"] }) {
  const { t } = useLocale();

  return (
    <aside>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#075985]">{t('yourTrail')}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.06em] text-[#0F2A3D]">{t('recentActivity')}</h2>
        </div>
        <Activity size={19} className="text-[#0369A1]/45" />
      </div>
      <div className="rounded-[23px] border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
        <div className="space-y-1">
          {activities.map((activity) => {
            const Icon = activityIcon[activity.type];
            return (
              <div key={activity.id} className="flex gap-3 border-b border-[#0369A1]/10 py-4 first:pt-1 last:border-0 last:pb-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0369A1]">
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] font-bold leading-4 text-[#0F2A3D]">{activity.title}</h3>
                  <p className="mt-1 text-[10px] text-[#5B7184]">{activity.timestamp}</p>
                </div>
                <span className="h-fit rounded-full bg-[#E0F2FE] px-2 py-1 text-[9px] font-bold text-[#0369A1]">{activity.status}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 border-t border-[#0369A1]/10 pt-4 text-[10px] leading-4 text-[#5B7184]">{t('activitySyncDescription')}</div>
      </div>
    </aside>
  );
}
