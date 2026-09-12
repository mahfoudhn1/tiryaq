import { burnTbsaCalculator } from './burnTbsa';
import { gcsCalculator } from './gcs';
import { mapCalculator } from './map';
import { parklandCalculator } from './parkland';
import { shockIndexCalculator } from './shockIndex';
import type { CalculatorDefinition } from './types';

/**
 * Central registry of clinical calculators.
 *
 * To add a calculator: implement a `CalculatorDefinition` in this directory and
 * append it here. Routing, listing, and rendering are all derived from this
 * array, so no UI or route changes are required.
 */
export const CALCULATORS: readonly CalculatorDefinition[] = [
  mapCalculator,
  gcsCalculator,
  burnTbsaCalculator,
  parklandCalculator,
  shockIndexCalculator,
];

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return CALCULATORS.find((calculator) => calculator.slug === slug);
}

export type { CalculatorDefinition } from './types';
