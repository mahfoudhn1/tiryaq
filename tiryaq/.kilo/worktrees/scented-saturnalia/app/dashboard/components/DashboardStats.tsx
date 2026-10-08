'use client';

import Link from "next/link";
import { Activity, Flame, Layers3, Stethoscope } from "lucide-react";
import { DashboardSummary } from "@/types/medical";
import { useLocale } from '@/lib/i18n/useLocale';

export function DashboardStats({ summary }: { summary: DashboardSummary }) {
  const { t } = useLocale();
  const progress = Math.min(100, Math.round((summary.dailyCompleted / summary.dailyGoal) * 100));
  const stats = [
    { label: t('dailyGoal'), value: `${summary.dailyCompleted}/${summary.dailyGoal}`, detail: t('cardsCompleted'), icon: Activity, color: "teal", progress },
    { label: t('studyStreak'), value: summary.streakDays, detail: t('consecutiveDays'), icon: Flame, color: "blue" },
    { label: t('dueFlashcards'), value: summary.dueFlashcardsCount, detail: t('readyForReview'), icon: Layers3, color: "cyan", href: "/flashcards/review" },
    { label: t('activeCases'), value: summary.dueCasesCount, detail: t('clinicalSimulations'), icon: Stethoscope, color: "navy", href: "/cases/case-101" },
  ];

  return <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(({ label, value, detail, icon: Icon, color, href, progress: statProgress }) => { const card = <div className="group rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#8ecfd3]"><div className="flex items-start justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#64748b]">{label}</span><span className={`flex h-8 w-8 items-center justify-center rounded-xl ${color === "teal" ? "bg-[#d9f3f1] text-[#008080]" : color === "blue" ? "bg-[#dbeafe] text-[#1e3a8a]" : color === "cyan" ? "bg-[#e0f2fe] text-[#0e7490]" : "bg-[#e2e8f0] text-[#0f172a]"}`}><Icon size={16} /></span></div><div className="mt-5 flex items-baseline gap-2"><span className="text-3xl font-bold tracking-[-0.07em] text-[#0f172a]">{value}</span><span className="text-[11px] text-[#64748b]">{detail}</span></div>{statProgress !== undefined ? <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e2eaee]"><div className="h-full rounded-full bg-[#0e7490]" style={{ width: `${statProgress}%` }} /></div> : <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-[#0e7490]">{t('viewDetails')} <span className="transition-transform group-hover:translate-x-1">→</span></div>}</div>; return href ? <Link key={label} href={href}>{card}</Link> : <div key={label}>{card}</div>; })}</section>;
}
