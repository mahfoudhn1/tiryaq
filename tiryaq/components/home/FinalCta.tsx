import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Translate } from './shared';

export function FinalCta({ t }: { t: Translate }) {
  return (
    <section className="px-5 pb-20 sm:px-8 lg:pb-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="grid gap-8 border-y-2 border-[#123247] py-12 sm:grid-cols-[1.4fr_0.6fr] sm:items-center sm:gap-12">
          <div>
            <h2 className="home-display text-[clamp(2.1rem,4vw,3.2rem)] leading-[1.02] text-[#123247]">
              {t('homeCtaTitle')}
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#5B7184]">{t('homeCtaBody')}</p>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 justify-self-start rounded-full bg-[#0369A1] px-7 py-4 text-[14px] font-bold text-white transition-colors hover:bg-[#075985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2 sm:justify-self-end"
          >
            {t('homeCtaPrimary')}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
