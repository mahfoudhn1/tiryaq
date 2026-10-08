import { anionGapCalculator } from './anionGap';
import { ascvdCalculator } from './ascvd';
import { burnTbsaCalculator } from './burnTbsa';
import { chadsVascCalculator } from './chadsVasc';
import { childPughCalculator } from './childPugh';
import { cockcroftGaultCalculator } from './cockcroftGault';
import { correctedCalciumCalculator } from './correctedCalcium';
import { correctedSodiumCalculator } from './correctedSodium';
import { curb65Calculator } from './curb65';
import { egfrCkdEpiCalculator } from './egfrCkdEpi';
import { fenaCalculator } from './fena';
import { feureaCalculator } from './feurea';
import { freeWaterDeficitCalculator } from './freeWaterDeficit';
import { gcsCalculator } from './gcs';
import { gbsCalculator } from './glasgowBlatchford';
import { graceCalculator } from './grace';
import { hasBledCalculator } from './hasBled';
import { heartScoreCalculator } from './heart';
import { mapCalculator } from './map';
import { meldNaCalculator } from './meldNa';
import { news2Calculator } from './news2';
import { nihssCalculator } from './nihss';
import { osmolarGapCalculator } from './osmolarGap';
import { parklandCalculator } from './parkland';
import { percCalculator } from './perc';
import { qsofaCalculator } from './qsofa';
import { qtcCalculator } from './qtc';
import { serumOsmolalityCalculator } from './serumOsmolality';
import { shockIndexCalculator } from './shockIndex';
import { sirsCalculator } from './sirs';
import { sofaCalculator } from './sofa';
import { timiCalculator } from './timi';
import { wellsPeCalculator } from './wellsPe';
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
  wellsPeCalculator,
  percCalculator,
  qtcCalculator,
  chadsVascCalculator,
  hasBledCalculator,
  heartScoreCalculator,
  timiCalculator,
  ascvdCalculator,
  egfrCkdEpiCalculator,
  cockcroftGaultCalculator,
  anionGapCalculator,
  correctedCalciumCalculator,
  correctedSodiumCalculator,
  fenaCalculator,
  feureaCalculator,
  freeWaterDeficitCalculator,
  serumOsmolalityCalculator,
  osmolarGapCalculator,
  qsofaCalculator,
  sirsCalculator,
  sofaCalculator,
  news2Calculator,
  curb65Calculator,
  nihssCalculator,
  gbsCalculator,
  childPughCalculator,
  meldNaCalculator,
  graceCalculator,
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
  { id: 'nephrology', titleKey: 'nephrology', descriptionKey: 'nephrologyDescription' },
  { id: 'clinicalScores', titleKey: 'clinicalScores', descriptionKey: 'clinicalScoresDescription' },
];

export function getCalculatorsByCategory(categoryId: string): CalculatorDefinition[] {
  return CALCULATORS.filter(
    (calculator) =>
      calculator.categoryKey === categoryId || calculator.alsoInCategories?.includes(categoryId)
  );
}

export type { CalculatorDefinition } from './types';
