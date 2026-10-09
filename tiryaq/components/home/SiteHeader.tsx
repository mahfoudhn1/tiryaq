import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { LANGUAGES, type Language } from '@/store/slices/localeSlice';
import type { Translate } from './shared';

const NAV: { href: string; key: Parameters<Translate>[0] }[] = [
  { href: '#learn', key: 'homeNavLearn' },
  { href: '#practice', key: 'homeNavPractice' },
  { href: '#tools', key: 'homeNavTools' },
  { href: '#instructors', key: 'homeNavInstructors' },
  { href: '#faq', key: 'homeNavFaq' },
];

const LANGUAGE_LABELS: Record<Language, Parameters<Translate>[0]> = {
  en: 'english',
  fr: 'french',
  ar: 'arabic',
};

interface SiteHeaderProps {
  t: Translate;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function SiteHeader({ t, language, onLanguageChange }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#DCE3EA] bg-[#F4F9FD]/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Tiryaq home">
          <Image src="/tiryaqlogonobg.png" alt="Tiryaq" width={512} height={260} className="h-[72px] w-[160px] object-contain sm:w-[180px]" />
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-semibold text-[#5B7184] md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-sm transition-colors hover:text-[#123247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <label className="relative flex items-center">
            <span className="sr-only">{t('language')}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as Language)}
              aria-label={t('language')}
              className="cursor-pointer appearance-none rounded-full border border-[#C9DCED] bg-white py-2 pe-8 ps-3 text-[12px] font-bold text-[#123247] outline-none transition-colors hover:border-[#1E8A82] focus-visible:border-[#0369A1] focus-visible:ring-2 focus-visible:ring-[#0369A1]/40"
            >
              {LANGUAGES.map((item) => (
                <option key={item} value={item}>
                  {t(LANGUAGE_LABELS[item])}
                </option>
              ))}
            </select>
            <ChevronRight size={14} className="pointer-events-none absolute end-2 rotate-90 text-[#123247]" />
          </label>
          <Link
            href="/login"
            className="hidden rounded-sm px-3 py-2 text-[13px] font-bold text-[#5B7184] transition-colors hover:text-[#123247] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]/40 sm:block"
          >
            {t('homeSignIn')}
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#0369A1] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#075985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2"
          >
            {t('homeGetStarted')}
          </Link>
        </div>
      </div>
    </header>
  );
}
