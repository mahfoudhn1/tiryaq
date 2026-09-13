import { burnTbsaCalculator } from './burnTbsa';
import { chadsVascCalculator } from './chadsVasc';
import { gcsCalculator } from './gcs';
import { hasBledCalculator } from './hasBled';
import { heartScoreCalculator } from './heart';
import { mapCalculator } from './map';
import { parklandCalculator } from './parkland';
import { qtcCalculator } from './qtc';
import { shockIndexCalculator } from './shockIndex';
import type { CalculatorDefinition } from './types';
import type { TranslationKey } from '@/lib/i18n/translations';

/**
 * Central registry of clinical calculators.
 *
 * To add a calculator: implement a `CalculatorDefinition` in this directory and
 * append it here. It then appears as a card on /emergency and opens at
 * /emergency/<slug>; no UI or route changes are required.
 */
export const CALCULATORS: readonly CalculatorDefinition[] = [
  mapCalculator,
  gcsCalculator,
  burnTbsaCalculator,
  parklandCalculator,
  shockIndexCalculator,
  qtcCalculator,
  chadsVascCalculator,
  hasBledCalculator,
  heartScoreCalculator,
];

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return CALCULATORS.find((calculator) => calculator.slug === slug);
}

/** A display grouping for the calculators hub, in presentation order. */
export interface CalculatorCategory {
  id: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}

export const CALCULATOR_CATEGORIES: readonly CalculatorCategory[] = [
  {
    id: 'emergencyAndTrauma',
    titleKey: 'emergencyAndTrauma',
    descriptionKey: 'emergencyAndTraumaDescription',
  },
  { id: 'cardiology', titleKey: 'cardiology', descriptionKey: 'cardiologyDescription' },
];

export function getCalculatorsByCategory(categoryId: string): CalculatorDefinition[] {
  return CALCULATORS.filter((calculator) => calculator.categoryKey === categoryId);
}

export type { CalculatorDefinition } from './types';
