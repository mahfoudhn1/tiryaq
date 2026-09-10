'use client';

import { translate, type TranslationKey } from './translations';
import { useAppSelector } from '@/store/hooks';

export function useLocale() {
  const language = useAppSelector((state) => state.locale.language);

  return {
    language,
    t: (key: TranslationKey) => translate(language, key),
  };
}
