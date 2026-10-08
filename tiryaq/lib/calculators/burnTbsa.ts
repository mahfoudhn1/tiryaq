import type { CalculationOutcome, CalculatorDefinition, CalculatorErrors, CalculatorField } from './types';
import { ADULT_RULE_OF_NINES } from './ruleOfNines';
import {
  assignError,
  validateNumberField,
} from './validation';

const REGION_EXCEEDS_MAX_ERROR = 'regionExceedsMaxError';
const TOTAL_EXCEEDS_100_ERROR = 'totalExceeds100Error';

const regionFields: readonly CalculatorField[] = ADULT_RULE_OF_NINES.map((region) => ({
  id: region.id,
  labelKey: region.labelKey,
  unit: '%',
  placeholder: '0',
  min: 0,
  step: 0.5,
  inputMode: 'decimal',
}));

/**
 * Pure, deterministic TBSA calculation. Returns a structured `data.tbsaPercent`
 * so a future Parkland calculator can consume the result directly.
 */
function calculateTbsa(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};
  const affected: { region: (typeof ADULT_RULE_OF_NINES)[number]; value: number }[] = [];

  for (const region of ADULT_RULE_OF_NINES) {
    const result = validateNumberField(values[region.id], {
      min: 0,
      max: region.maxPercent,
      maxError: REGION_EXCEEDS_MAX_ERROR,
    });
    assignError(errors, region.id, result);

    if (result.ok && result.value !== null && result.value > 0) {
      affected.push({ region, value: result.value });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const total = affected.reduce((sum, entry) => sum + entry.value, 0);
  const rounded = Math.round((total + Number.EPSILON) * 10) / 10;

  if (rounded > 100) {
    return { ok: false, errors: { [ADULT_RULE_OF_NINES[0].id]: TOTAL_EXCEEDS_100_ERROR } };
  }

  const breakdown =
    affected.length > 0
      ? affected.map((entry) => `${entry.value}%`).join(' + ')
      : '0%';

  return {
    ok: true,
    metrics: [
      {
        id: 'tbsa',
        labelKey: 'estimatedTbsa',
        value: `${rounded.toFixed(1)}%`,
        primary: true,
      },
    ],
    working: `${breakdown} = ${rounded.toFixed(1)}%`,
    data: { tbsaPercent: rounded },
    warnings: ['burnDepthNote'],
  };
}

export const burnTbsaCalculator: CalculatorDefinition = {
  id: 'burn-tbsa',
  slug: 'burn-tbsa',
  categoryKey: 'emergencyAndTrauma',
  titleKey: 'burnTbsaCalculator',
  descriptionKey: 'burnTbsaDescription',
  fields: regionFields,
  formula: 'TBSA = Σ affected region percentages',
  formulaDescriptionKey: 'burnTbsaFormulaDescription',
  interpretationKey: 'burnTbsaInterpretation',
  clinicalNoteKey: 'burnTbsaClinicalNote',
  source: 'Adult Rule of Nines: head/neck 9%, each arm 9%, anterior trunk 18%, posterior trunk 18%, each leg 18%, perineum 1%.',
  calculate: calculateTbsa,
};
