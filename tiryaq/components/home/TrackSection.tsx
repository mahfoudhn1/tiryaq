import { Flame, TrendingUp } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Translate } from './shared';

const BARS = [38, 52, 47, 63, 58, 71, 66, 80, 74, 86, 81, 92];

export function TrackSection({ t }: { t: Translate }) {
  return (
    <section id="track" className="border-b border-[#DCE3EA] bg-[#F4F9FD]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">{t('homeTrackLabel')}</p>
            <h2 className="home-display mt-5 text-4xl leading-[1.04] text-[#123247] sm:text-5xl">{t('homeTrackTitle')}</h2>
          </div>
          <p className="max-w-sm text-[15px] leading-7 text-[#5B7184] lg:pb-2">{t('homeTrackBody')}</p>
        </Reveal>

        <Reveal delay={100} className="mt-12">
          <div className="grid gap-px overflow-hidden rounded-[26px] border border-[#DCE3EA] bg-[#DCE3EA] lg:grid-cols-5">
            <div className="bg-white p-7 lg:col-span-2">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#93A5B3]">
                <Flame size={14} className="text-[#1E8A82]" />
                {t('homeTrackStreak')}
              </p>
              <p className="home-display mt-5 text-[84px] leading-[0.85] text-[#123247] sm:text-[104px]">14</p>
              <p className="mt-2 text-[14px] text-[#5B7184]">{t('consecutiveDays')}</p>
            </div>

            <div className="bg-white p-7 lg:col-span-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#93A5B3]">
                  <TrendingUp size={14} className="text-[#1E8A82]" />
                  {t('homeTrackWeek')}
                </p>
                <span className="home-display text-[26px] leading-none text-[#1E8A82]">{t('accuracy')}</span>
              </div>
              <div className="mt-8 flex h-[112px] items-end gap-1.5" aria-hidden>
                {BARS.map((height, index) => (
                  <span
                    key={index}
                    style={{ height: `${height}%` }}
                    className={`flex-1 rounded-t-[3px] ${index === BARS.length - 1 ? 'bg-[#1E8A82]' : 'bg-[#C9DCED]'}`}
                  />
                ))}
              </div>
              <p className="mt-4 border-t border-[#E1E7EE] pt-4 text-[12px] text-[#5B7184]">{t('cardsReviewed')}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[26px] border border-[#DCE3EA] bg-white p-7">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#93A5B3]">{t('homeTrackMastery')}</p>
              <span className="text-[13px] font-semibold text-[#123247]">{t('yourTrail')}</span>
            </div>
            <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-[#E7EEF5]" aria-hidden>
              <span className="w-[46%] bg-[#1E8A82]" />
              <span className="w-[28%] bg-[#3FC7B8]" />
              <span className="w-[16%] bg-[#8FD9CE]" />
              <span className="w-[10%] bg-[#C9DCED]" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
