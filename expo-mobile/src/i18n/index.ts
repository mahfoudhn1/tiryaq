import { useAppSelector } from '@/store/hooks';
import type { Language } from '@/store/slices/settingsSlice';
import { en, type Dictionary, type TranslationKey } from './en';
import { fr } from './fr';
import { ar } from './ar';

export const dictionaries: Record<Language, Dictionary> = { en, fr, ar };
export type { TranslationKey };

export function translate(language: Language, key: TranslationKey): string {
  return dictionaries[language]?.[key] ?? en[key] ?? key;
}

export function useTranslation() {
  const language = useAppSelector((s) => s.settings.language);
  return {
    language,
    isRTL: language === 'ar',
    t: (key: TranslationKey) => translate(language, key),
  };
}

export const LANGUAGES: { code: Language; labelKey: TranslationKey }[] = [
  { code: 'en', labelKey: 'languageEnglish' },
  { code: 'fr', labelKey: 'languageFrench' },
  { code: 'ar', labelKey: 'languageArabic' },
];
