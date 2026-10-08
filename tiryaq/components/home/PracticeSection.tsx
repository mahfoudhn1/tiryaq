'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Check, RotateCcw, X } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Translate } from './shared';

type FeatureKey = { title: Parameters<Translate>[0]; text: Parameters<Translate>[0]; href: string };

const FEATURES: FeatureKey[] = [
  { title: 'homePracticeQbankTitle', text: 'homePracticeQbankText', href: '/qbank/session' },
  { title: 'homePracticeQuizTitle', text: 'homePracticeQuizText', href: '/qbank/session' },
  { title: 'homePracticeFlashTitle', text: 'homePracticeFlashText', href: '/flashcards/review' },
];

const ANSWER_KEYS: Parameters<Translate>[0][] = [
  'homePracticeAnswerA',
  'homePracticeAnswerB',
  'homePracticeAnswerC',
  'homePracticeAnswerD',
];

const CORRECT_INDEX = 1;

export function PracticeSection({ t }: { t: Translate }) {
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="practice" className="border-b border-[#DCE3EA] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">{t('homePracticeLabel')}</p>
            <h2 className="home-display mt-5 text-4xl leading-[1.04] text-[#123247] sm:text-5xl">{t('homePracticeTitle')}</h2>
          </div>
          <p className="max-w-sm text-[15px] leading-7 text-[#5B7184] lg:pb-2">{t('homePracticeBody')}</p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <Reveal>
            <div
              role="group"
              tabIndex={0}
              onKeyDown={(event) => {
                const index = Number(event.key) - 1;
                if (index >= 0 && index < ANSWER_KEYS.length) setSelected(index);
              }}
              className="rounded-[26px] border border-[#C9DCED] bg-[#F4F9FD] p-3 outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40 focus-visible:ring-offset-2 sm:p-5"
            >
              <div className="rounded-[18px] bg-white p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E8A82]">
                    {t('homePracticeQuestionLabel')}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#93A5B3]">
                    {t('homePracticeKeys')}
                  </span>
                </div>
                <p className="mt-5 text-[17px] font-semibold leading-7 text-[#123247]">{t('homePracticeQuestion')}</p>

                <div className="mt-5 divide-y divide-[#E1E7EE] border-y border-[#E1E7EE]">
                  {ANSWER_KEYS.map((key, index) => {
                    const isCorrect = index === CORRECT_INDEX;
                    const isSelected = selected === index;
                    const reveal = selected !== null;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelected(index)}
                        className={`flex w-full items-center gap-4 py-3.5 text-start text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40 ${
                          reveal && isCorrect
                            ? 'text-[#1E8A82]'
                            : reveal && isSelected
                              ? 'text-[#B45454]'
                              : 'text-[#5B7184] hover:text-[#123247]'
                        }`}
                      >
                        <span className="home-display w-5 text-[16px] text-[#93A5B3]">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 font-medium">{t(key)}</span>
                        {reveal && isCorrect && <Check size={15} className="text-[#1E8A82]" />}
                        {reveal && isSelected && !isCorrect && <X size={15} className="text-[#B45454]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 min-h-[52px]">
                  {selected !== null && (
                    <p className="border-s-2 border-[#1E8A82] ps-4 text-[13px] leading-6 text-[#123247]">
                      {t('homePracticeAnswerNote')}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E1E7EE] pt-4">
                  <span className="me-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#93A5B3]">
                    {t('homePracticeFlashTitle')}
                  </span>
                  {(['homePracticeAgain', 'homePracticeHard', 'homePracticeGood', 'homePracticeEasy'] as const).map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelected(null);
                          setFlipped(false);
                        }}
                        className="rounded-full border border-[#C9DCED] px-3.5 py-1.5 text-[12px] font-bold text-[#5B7184] transition-colors hover:border-[#0369A1] hover:text-[#0369A1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
                      >
                        {t(key)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFlipped((value) => !value)}
                aria-pressed={flipped}
                className="mt-3 w-full rounded-[18px] bg-[#061019] p-5 text-start text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DD3FC]/60 sm:p-6"
              >
                <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#7DD3FC]">
                  {t('homeMockFlashcardLabel')}
                  <RotateCcw size={14} />
                </span>
                <span className="mt-4 block text-[15px] font-semibold leading-6">
                  {flipped ? t('homePracticeFlashBack') : t('homeMockFlashcard')}
                </span>
              </button>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:pt-2">
            <ul className="divide-y divide-[#DCE3EA] border-t border-[#DCE3EA]">
              {FEATURES.map((feature, index) => (
                <li key={feature.title}>
                  <Link
                    href={feature.href}
                    className="group grid grid-cols-[40px_1fr_auto] items-center gap-4 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
                  >
                    <span className="home-display text-[26px] leading-none text-[#C9DCED] transition-colors group-hover:text-[#1E8A82]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="home-display block text-[19px] leading-tight text-[#123247]">
                        {t(feature.title)}
                      </span>
                      <span className="mt-1.5 block text-[13px] leading-6 text-[#5B7184]">{t(feature.text)}</span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-[#93A5B3] transition-colors group-hover:text-[#1E8A82]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
