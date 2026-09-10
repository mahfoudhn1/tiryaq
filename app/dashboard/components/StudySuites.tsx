'use client';

import Link from "next/link";
import { ArrowUpRight, BarChart3, BrainCircuit, ClipboardCheck, Stethoscope } from "lucide-react";
import { DashboardSummary } from "@/types/medical";
import { useLocale } from '@/lib/i18n/useLocale';

const suites = [
  { title: 'spacedRepetition', text: 'spacedRepetitionDescription', icon: BrainCircuit, href: "/flashcards/review", action: 'reviewNow', meta: 'flashcardsDue', color: "teal" },
  { title: 'clinicalCases', text: 'clinicalCasesDescription', icon: Stethoscope, href: "/cases/case-101", action: 'openCase', meta: 'caseReady', color: "blue" },
  { title: 'qbankBlock', text: 'qbankBlockDescription', icon: ClipboardCheck, href: "/quiz/1", action: 'startBlock', meta: 'questionsAvailable', color: "cyan" },
  { title: 'performance', text: 'performanceDescription', icon: BarChart3, href: "/analytics", action: 'viewAnalytics', meta: 'accuracy', color: "navy" },
] as const;

export function StudySuites({ summary }: { summary: DashboardSummary }) {
  const { t } = useLocale();
  const meta = [summary.dueFlashcardsCount, summary.dueCasesCount, summary.dueQuizQuestionsCount, "" ];
  return <section><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">{t('yourStudySpace')}</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.06em] text-[#0f172a]">{t('pickUpWhereLeftOff')}</h2></div><span className="hidden text-[11px] font-semibold text-[#64748b] sm:block">{t('waysToMakeProgress')}</span></div><div className="grid gap-4 sm:grid-cols-2">{suites.map(({ title, text, icon: Icon, href, action, meta: metaLabel, color }, index) => <div key={title} className="group flex min-h-[205px] flex-col justify-between rounded-[23px] border border-[#dce7eb] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-1 hover:border-[#8ecfd3] hover:shadow-[0_16px_32px_rgba(14,116,144,0.09)]"><div><div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color === "teal" ? "bg-[#d9f3f1] text-[#008080]" : color === "blue" ? "bg-[#dbeafe] text-[#1e3a8a]" : color === "cyan" ? "bg-[#e0f2fe] text-[#0e7490]" : "bg-[#e2e8f0] text-[#0f172a]"}`}><Icon size={19} /></span><ArrowUpRight size={17} className="text-[#cbd5e1] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0e7490]" /></div><h3 className="mt-5 text-[17px] font-bold tracking-[-0.04em] text-[#0f172a]">{t(title)}</h3><p className="mt-2 text-[13px] leading-5 text-[#64748b]">{t(text)}</p></div><div className="mt-5 flex items-center justify-between"><span className="text-[10px] font-semibold text-[#94a3b8]">{index < 3 ? `${meta[index]} ${t(metaLabel)}` : t(metaLabel)}</span><Link href={href} className="rounded-full bg-[#0f172a] px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#0e7490]">{t(action)}</Link></div></div>)}</div></section>;
}
