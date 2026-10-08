import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Translate } from './shared';

type Step = { title: Parameters<Translate>[0]; body: Parameters<Translate>[0] };

const STEPS: Step[] = [
  { title: 'homeCasesStep1Title', body: 'homeCasesStep1Body' },
  { title: 'homeCasesStep2Title', body: 'homeCasesStep2Body' },
  { title: 'homeCasesStep3Title', body: 'homeCasesStep3Body' },
  { title: 'homeCasesStep4Title', body: 'homeCasesStep4Body' },
];

export function CasesSection({ t }: { t: Translate }) {
  return (
    <section id="cases" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">{t('homeCasesLabel')}</p>
          <h2 className="home-display mt-5 text-4xl leading-[1.04] text-[#123247] sm:text-5xl">{t('homeCasesTitle')}</h2>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5B7184]">{t('homeCasesBody')}</p>
          <Link
            href="/cases"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#C9DCED] px-5 py-3 text-[13px] font-bold text-[#123247] transition-colors hover:border-[#0369A1] hover:text-[#0369A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
          >
            {t('homeLearnCta')}
            <ArrowRight size={16} />
          </Link>
        </Reveal>

        <ol className="border-s border-[#DCE3EA] ps-6 sm:ps-10">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative pb-9 last:pb-0">
              <span className="absolute -start-[37px] top-1 h-4 w-4 rounded-full border-2 border-[#1E8A82] bg-[#F4F9FD] sm:-start-[49px]" aria-hidden />
              <Reveal delay={index * 70}>
                <span className="home-display text-[13px] tracking-[0.14em] text-[#1E8A82]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="home-display mt-2 text-[22px] leading-tight text-[#123247] sm:text-[26px]">
                  {t(step.title)}
                </h3>
                <p className="mt-2 max-w-lg text-[14px] leading-7 text-[#5B7184]">{t(step.body)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
