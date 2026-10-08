import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Translate } from './shared';

type Point = { title: Parameters<Translate>[0]; text: Parameters<Translate>[0] };

const POINTS: Point[] = [
  { title: 'homeInstructorsP1Title', text: 'homeInstructorsP1Text' },
  { title: 'homeInstructorsP2Title', text: 'homeInstructorsP2Text' },
  { title: 'homeInstructorsP3Title', text: 'homeInstructorsP3Text' },
];

export function InstructorsSection({ t }: { t: Translate }) {
  return (
    <section id="instructors" className="border-b border-[#DCE3EA] bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-28">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">{t('homeInstructorsLabel')}</p>
          <h2 className="home-display mt-5 text-4xl leading-[1.04] text-[#123247] sm:text-5xl">
            {t('homeInstructorsTitle')}
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#5B7184]">{t('homeInstructorsBody')}</p>
          <Link
            href="/instructor"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0369A1] px-5 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#075985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2"
          >
            {t('homeInstructorsCta')}
            <ArrowRight size={16} />
          </Link>
        </Reveal>

        <ol className="divide-y divide-[#DCE3EA] border-t border-[#DCE3EA]">
          {POINTS.map((point, index) => (
            <li key={point.title}>
              <Reveal delay={index * 80}>
                <div className="grid grid-cols-[56px_1fr] gap-4 py-8 sm:grid-cols-[96px_1fr] sm:gap-8">
                  <span className="home-display text-[44px] leading-none text-[#DCF0F6] sm:text-[64px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="pt-1">
                    <h3 className="home-display text-[22px] leading-tight text-[#123247] sm:text-[26px]">
                      {t(point.title)}
                    </h3>
                    <p className="mt-3 max-w-md text-[14px] leading-7 text-[#5B7184]">{t(point.text)}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
