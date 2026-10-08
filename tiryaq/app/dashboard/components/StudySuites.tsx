'use client';

import Link from "next/link";
import { ArrowUpRight, BarChart3, BrainCircuit, ClipboardCheck, Stethoscope } from "lucide-react";
import { DashboardSummary } from "@/types/medical";
import { useLocale } from '@/lib/i18n/useLocale';

const TILES = {
  teal: 'bg-[#E0F2FE] text-[#0369A1]',
  blue: 'bg-[#F0F9FF] text-[#0369A1]',
  cyan: 'bg-[#CFFAFE] text-[#0369A1]',
  navy: 'bg-[#DCEEFC] text-[#0369A1]',
};

const suites = [
  { title: 'spacedRepetition', text: 'spacedRepetitionDescription', icon: BrainCircuit, href: "/flashcards/review", action: 'reviewNow', meta: 'flashcardsDue', color: "teal" },
  { title: 'clinicalCases', text: 'clinicalCasesDescription', icon: Stethoscope, href: "/cases", action: 'openCase', meta: 'caseReady', color: "blue" },
  { title: 'qbankBlock', text: 'qbankBlockDescription', icon: ClipboardCheck, href: "/qbank/session", action: 'startBlock', meta: 'questionsAvailable', color: "cyan" },
  { title: 'performance', text: 'performanceDescription', icon: BarChart3, href: "/analytics", action: 'viewAnalytics', meta: 'accuracy', color: "navy" },
] as const;

export function StudySuites({ summary }: { summary: DashboardSummary }) {
  const { t } = useLocale();
  const meta = [summary.dueFlashcardsCount, summary.dueCasesCount, summary.dueQuizQuestionsCount, ""];

  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#075985]">{t('yourStudySpace')}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.06em] text-[#0F2A3D]">{t('pickUpWhereLeftOff')}</h2>
        </div>
        <span className="hidden text-[11px] font-semibold text-[#5B7184] sm:block">{t('waysToMakeProgress')}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {suites.map(({ title, text, icon: Icon, href, action, meta: metaLabel, color }, index) => (
          <div key={title} className="group flex min-h-[205px] flex-col justify-between rounded-[23px] border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#38BDF8] hover:shadow-[0_16px_34px_rgba(14,116,201,0.14)]">
            <div>
              <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TILES[color]}`}>
                  <Icon size={19} />
                </span>
                <ArrowUpRight size={17} className="text-[#0369A1]/45 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#075985]" />
              </div>
              <h3 className="mt-5 text-[17px] font-bold tracking-[-0.04em] text-[#0F2A3D]">{t(title)}</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#5B7184]">{t(text)}</p>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#5B7184]">{index < 3 ? `${meta[index]} ${t(metaLabel)}` : t(metaLabel)}</span>
              <Link href={href} className="rounded-full bg-[#075985] px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#0369A1]">{t(action)}</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
