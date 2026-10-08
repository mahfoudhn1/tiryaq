import { ChevronDown } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Translate } from './shared';

const ITEMS: { q: Parameters<Translate>[0]; a: Parameters<Translate>[0] }[] = [
  { q: 'homeFaqQ1', a: 'homeFaqA1' },
  { q: 'homeFaqQ2', a: 'homeFaqA2' },
  { q: 'homeFaqQ3', a: 'homeFaqA3' },
  { q: 'homeFaqQ4', a: 'homeFaqA4' },
  { q: 'homeFaqQ5', a: 'homeFaqA5' },
  { q: 'homeFaqQ6', a: 'homeFaqA6' },
];

export function FaqSection({ t }: { t: Translate }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
      <Reveal className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">{t('homeFaqLabel')}</p>
        <h2 className="home-display mt-5 text-4xl leading-[1.04] text-[#123247] sm:text-5xl">{t('homeFaqTitle')}</h2>
      </Reveal>

      <Reveal delay={80} className="mt-12 border-t border-[#DCE3EA]">
        {ITEMS.map((item) => (
          <details key={item.q} className="group border-b border-[#DCE3EA]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-[15px] font-bold text-[#123247] [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40">
              {t(item.q)}
              <ChevronDown size={18} className="shrink-0 text-[#1E8A82] transition-transform group-open:rotate-180" />
            </summary>
            <p className="max-w-2xl pb-6 text-[14px] leading-7 text-[#5B7184]">{t(item.a)}</p>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
