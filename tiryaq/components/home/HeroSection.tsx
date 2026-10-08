import Link from 'next/link';
import { ArrowUpRight, BrainCircuit, CirclePlay, HeartPulse, Sparkles, Stethoscope } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Translate } from './shared';

export function HeroSection({ t }: { t: Translate }) {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:pb-32">
      <div className="grid items-center gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <Reveal className="max-w-xl">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">
            <span className="h-px w-8 bg-[#1E8A82]/50" aria-hidden />
            {t('homeHeroBadge')}
          </p>
          <h1 className="home-display mt-6 text-[clamp(2.85rem,6vw,5.6rem)] leading-[0.96] text-[#123247]">
            {t('homeHeroTitle')}
            <span className="block text-[#1E8A82]">{t('homeHeroTitleAccent')}</span>
          </h1>
          <p className="mt-7 max-w-[520px] text-[17px] leading-8 text-[#5B7184]">{t('homeHeroSub')}</p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#0369A1] px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#075985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2 sm:w-auto"
            >
              {t('homeCtaPrimary')}
              <ArrowUpRight size={17} />
            </Link>
            <a
              href="#learn"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-bold text-[#123247] transition-colors hover:text-[#0369A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
            >
              <CirclePlay size={18} className="text-[#1E8A82]" />
              {t('homeCtaSecondary')}
            </a>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative">
          <div className="relative grid gap-4 sm:grid-cols-2 lg:block lg:h-[540px]">
            <Mock
              className="lg:absolute lg:inset-x-6 lg:top-10 lg:rotate-[-0.6deg]"
              icon={<BrainCircuit size={17} />}
              label={t('homeMockQbankLabel')}
              accent
            >
              {t('homeMockQbankQuestion')}
            </Mock>
            <Mock
              className="lg:absolute lg:-start-2 lg:top-0 lg:w-[220px] lg:rotate-[2deg]"
              icon={<Sparkles size={15} />}
              label={t('homeMockFlashcardLabel')}
            >
              {t('homeMockFlashcard')}
            </Mock>
            <Mock
              className="lg:absolute lg:-end-1 lg:bottom-6 lg:w-[240px] lg:rotate-[-2deg]"
              icon={<Stethoscope size={15} />}
              label={t('homeMockCalcLabel')}
            >
              {t('homeMockCalc')}
            </Mock>
            <Mock
              className="sm:col-span-2 lg:absolute lg:bottom-0 lg:start-6 lg:w-[360px] lg:rotate-[0.8deg]"
              icon={<HeartPulse size={15} />}
              label={t('homeMockCaseLabel')}
            >
              {t('homeMockCase')}
            </Mock>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Mock({
  children,
  icon,
  label,
  className = '',
  accent = false,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] border border-[#C9DCED] bg-white p-4 shadow-[0_22px_55px_rgba(2,60,90,0.13)] ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            accent ? 'bg-[#123247] text-[#8FD9CE]' : 'bg-[#DCF0F6] text-[#1E8A82]'
          }`}
        >
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#93A5B3]">{label}</span>
          <span className="mt-1.5 block text-[14px] font-semibold leading-6 text-[#123247]">{children}</span>
        </span>
      </div>
    </div>
  );
}
