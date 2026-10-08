'use client';

import { useAppDispatch } from '@/store/hooks';
import { setLanguage, type Language } from '@/store/slices/localeSlice';
import { useLocale } from '@/lib/i18n/useLocale';
import { SiteHeader } from '@/components/home/SiteHeader';
import { HeroSection } from '@/components/home/HeroSection';
import { ProblemSection } from '@/components/home/ProblemSection';
import { LearnSection } from '@/components/home/LearnSection';
import { PracticeSection } from '@/components/home/PracticeSection';
import { CasesSection } from '@/components/home/CasesSection';
import { BedsideSection } from '@/components/home/BedsideSection';
import { TrackSection } from '@/components/home/TrackSection';
import { InstructorsSection } from '@/components/home/InstructorsSection';
import { AlgeriaSection } from '@/components/home/AlgeriaSection';
import { FaqSection } from '@/components/home/FaqSection';
import { FinalCta } from '@/components/home/FinalCta';
import { SiteFooter } from '@/components/home/SiteFooter';

export default function HomeContent() {
  const dispatch = useAppDispatch();
  const { language, t } = useLocale();

  const changeLanguage = (nextLanguage: Language) => {
    dispatch(setLanguage(nextLanguage));
    window.localStorage.setItem('language', nextLanguage);
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      className="home-page min-h-screen overflow-x-hidden bg-[#F4F9FD] text-[#123247]"
    >
      <SiteHeader t={t} language={language} onLanguageChange={changeLanguage} />
      <main>
        <HeroSection t={t} />
        <ProblemSection t={t} />
        <LearnSection t={t} />
        <PracticeSection t={t} />
        <CasesSection t={t} />
        <BedsideSection t={t} />
        <TrackSection t={t} />
        <InstructorsSection t={t} />
        <AlgeriaSection t={t} />
        <FaqSection t={t} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} />
    </div>
  );
}
