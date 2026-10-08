import { Reveal } from './Reveal';
import type { Translate } from './shared';

export function AlgeriaSection({ t }: { t: Translate }) {
  return (
    <section
      className="border-y border-white/10 bg-[#061019] px-5 py-24 text-white sm:px-8 lg:py-32"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(125,211,252,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(125,211,252,0.06) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
    >
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7DD3FC]">{t('homeAlgeriaLabel')}</p>
        <h2 className="home-display mt-6 text-[clamp(2.5rem,5.4vw,4.4rem)] leading-[1.02]">{t('homeAlgeriaTitle')}</h2>
        <span className="mx-auto mt-8 block h-px w-24 bg-[#7DD3FC]/40" aria-hidden />
        <p className="mx-auto mt-8 max-w-2xl text-[16px] leading-8 text-[#9FB0BF]">{t('homeAlgeriaBody')}</p>
      </Reveal>
    </section>
  );
}
