'use client';

import Link from "next/link";
import { Activity, Flame, Layers3, Stethoscope, type LucideIcon } from "lucide-react";
import { DashboardSummary } from "@/types/medical";
import { useLocale } from '@/lib/i18n/useLocale';

const TILES = {
  teal: 'bg-[#E0F2FE] text-[#0369A1]',
  blue: 'bg-[#F0F9FF] text-[#0369A1]',
  cyan: 'bg-[#CFFAFE] text-[#0369A1]',
  navy: 'bg-[#DCEEFC] text-[#0369A1]',
};

interface StatItem {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  color: keyof typeof TILES;
  href?: string;
  progress?: number;
}

export function DashboardStats({ summary }: { summary: DashboardSummary }) {
  const { t } = useLocale();
  const progress = Math.min(100, Math.round((summary.dailyCompleted / summary.dailyGoal) * 100));

  const stats: StatItem[] = [
  { label: t('dailyGoal'), value: `${summary.dailyCompleted}/${summary.dailyGoal}`, detail: t('cardsCompleted'), icon: Activity, color: "teal", progress },
  { label: t('studyStreak'), value: summary.streakDays, detail: t('consecutiveDays'), icon: Flame, color: "blue" },
  { label: t('dueFlashcards'), value: summary.dueFlashcardsCount, detail: t('readyForReview'), icon: Layers3, color: "cyan", href: "/flashcards/review" },
  { label: t('activeCases'), value: summary.dueCasesCount, detail: t('clinicalSimulations'), icon: Stethoscope, color: "navy", href: "/cases" },
];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, detail, icon: Icon, color, href, progress: statProgress }) => {
        const card = (
          <div className="group rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[#38BDF8] hover:shadow-[0_16px_34px_rgba(14,116,201,0.12)]">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#5B7184]">{label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${TILES[color]}`}>
                <Icon size={16} />
              </span>
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-[-0.07em] text-[#0F2A3D]">{value}</span>
              <span className="text-[11px] text-[#5B7184]">{detail}</span>
            </div>
            {statProgress !== undefined ? (
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#0369A1]/15">
                <div className="h-full rounded-full bg-[#0284C7]" style={{ width: `${statProgress}%` }} />
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-[#075985]">
                {t('viewDetails')} <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            )}
          </div>
        );
        return href ? <Link key={label} href={href}>{card}</Link> : <div key={label}>{card}</div>;
      })}
    </section>
  );
}
