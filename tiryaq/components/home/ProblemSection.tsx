import { Reveal } from './Reveal';
import type { Translate } from './shared';

const LINES: Parameters<Translate>[0][] = [
  'homeProblemLine1',
  'homeProblemLine2',
  'homeProblemLine3',
  'homeProblemLine4',
];

export function ProblemSection({ t }: { t: Translate }) {
  return (
    <section id="problem" className="border-y border-[#DCE3EA] bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-28">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">{t('homeProblemLabel')}</p>
          <h2 className="home-display mt-5 text-4xl leading-[1.04] text-[#123247] sm:text-5xl">
            {t('homeProblemTitle')}
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <ul className="divide-y divide-[#E1E7EE] border-y border-[#E1E7EE]">
            {LINES.map((key, index) => (
              <li key={key} className="grid grid-cols-[64px_1fr] gap-4 py-6 sm:grid-cols-[88px_1fr] sm:gap-8">
                <span className="home-display text-[40px] leading-none text-[#C9DCED] sm:text-[52px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="self-center text-[15px] leading-7 text-[#5B7184]">{t(key)}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
