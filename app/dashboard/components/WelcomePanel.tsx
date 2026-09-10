'use client';

import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Check, Sparkles } from "lucide-react";
import { DashboardSummary } from "@/types/medical";
import { useLocale } from '@/lib/i18n/useLocale';

export function WelcomePanel({ summary }: { summary: DashboardSummary }) {
  const { t } = useLocale();
  const progress = Math.min(100, Math.round((summary.dailyCompleted / summary.dailyGoal) * 100));

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[#0f172a] px-6 py-8 text-white shadow-[0_20px_45px_rgba(15,23,42,0.14)] sm:px-9 sm:py-9">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#0e7490]/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-[#1e3a8a]/35 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#256b7d] bg-[#164e63]/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#67e8f9]"><Sparkles size={12} />{t('yourClinicalEdge')}</div><h1 className="max-w-xl text-4xl font-bold leading-[1.02] tracking-[-0.07em] sm:text-5xl">{t('goodMorning')}, Sarah<span className="text-[#67e8f9]">.</span></h1><p className="mt-4 max-w-lg text-[14px] leading-6 text-[#b9c7d7]">{t('focusedSession')}</p></div>
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e7490] text-white"><BrainCircuit size={16} /></span><span className="text-[12px] font-bold">{t('todaysFocus')}</span></div><span className="text-[11px] font-bold text-[#67e8f9]">{progress}% {t('complete')}</span></div><div className="mt-4 flex items-end justify-between"><div><div className="text-lg font-bold">Renal physiology</div><div className="mt-1 text-[11px] text-[#b9c7d7]">{summary.dailyCompleted} of {summary.dailyGoal} {t('cardsReviewed')}</div></div><Link href="/flashcards/review" className="flex items-center gap-1 text-[11px] font-bold text-[#67e8f9]">{t('continue')} <ArrowUpRight size={14} /></Link></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#0e7490]" style={{ width: `${progress}%` }} /></div></div>
      </div>
      <div className="relative mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b9c7d7]"><span className="flex items-center gap-1.5"><Check size={13} className="text-[#67e8f9]" />{t('noMissedReviews')}</span><span className="flex items-center gap-1.5"><Check size={13} className="text-[#67e8f9]" />{t('dayStreak')}</span></div>
    </section>
  );
}
