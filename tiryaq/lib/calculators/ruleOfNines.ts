import type { TranslationKey } from '@/lib/i18n/translations';

/**
 * A burn region with its maximum possible share of total body surface area,
 * expressed as a percentage. Kept separate from presentation so alternative
 * charts (e.g. pediatric Lund-Browder) can be modelled as sibling configurations.
 */
export interface BurnRegion {
  id: string;
  labelKey: TranslationKey;
  maxPercent: number;
}

/**
 * Standard adult Rule of Nines. Maxima intentionally sum to exactly 100%:
 * head/neck 9, each arm 9, anterior + posterior trunk 18 + 18, each leg 18,
 * perineum 1.
 */
export const ADULT_RULE_OF_NINES: readonly BurnRegion[] = [
  { id: 'headNeck', labelKey: 'burnHeadNeck', maxPercent: 9 },
  { id: 'rightArm', labelKey: 'burnRightArm', maxPercent: 9 },
  { id: 'leftArm', labelKey: 'burnLeftArm', maxPercent: 9 },
  { id: 'anteriorTrunk', labelKey: 'burnAnteriorTrunk', maxPercent: 18 },
  { id: 'posteriorTrunk', labelKey: 'burnPosteriorTrunk', maxPercent: 18 },
  { id: 'rightLeg', labelKey: 'burnRightLeg', maxPercent: 18 },
  { id: 'leftLeg', labelKey: 'burnLeftLeg', maxPercent: 18 },
  { id: 'perineum', labelKey: 'burnPerineum', maxPercent: 1 },
];

/** Sum of every region's maximum; used to assert the chart totals 100%. */
export const ADULT_RULE_OF_NINES_TOTAL = ADULT_RULE_OF_NINES.reduce(
  (sum, region) => sum + region.maxPercent,
  0
);
