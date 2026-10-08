import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';

/** Target serum sodium (mEq/L) used by the standard free-water-deficit estimate. */
export const FREE_WATER_TARGET_SODIUM = 140;

export interface FreeWaterDeficitInput {
  weightKg: number;
  sodium: number;
  female: boolean;
}

export interface FreeWaterDeficitResult {
  /** Estimated total body water in litres. */
  totalBodyWaterL: number;
  /** Estimated free-water deficit in litres. */
  freeWaterDeficitL: number;
}

/** Pure free-water-deficit estimate based on estimated total body water. */
export function calculateFreeWaterDeficit({
  weightKg,
  sodium,
  female,
}: FreeWaterDeficitInput): FreeWaterDeficitResult {
  const totalBodyWaterL = weightKg * (female ? 0.5 : 0.6);
  const freeWaterDeficitL = totalBodyWaterL * (sodium / FREE_WATER_TARGET_SODIUM - 1);
  return { totalBodyWaterL, freeWaterDeficitL };
}

const fields: readonly CalculatorField[] = [
  { id: 'weight', labelKey: 'labelWeight', unit: 'kg', placeholder: '70', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'sodium', labelKey: 'labelSerumSodium', unit: 'mEq/L', placeholder: '155', min: 0, step: 1, inputMode: 'numeric' },
  {
    id: 'sex',
    type: 'select',
    labelKey: 'labelSex',
    showOptionValue: false,
    options: [
      { value: 'male', labelKey: 'sexMale' },
      { value: 'female', labelKey: 'sexFemale' },
    ],
  },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const weight = validateNumberField(values.weight, { required: true, min: 0, exclusiveMin: true });
  const sodium = validateNumberField(values.sodium, { required: true, min: 0, exclusiveMin: true });
  const sex = validateSelectField(values.sex, ['male', 'female']);

  assignError(errors, 'weight', weight);
  assignError(errors, 'sodium', sodium);
  assignError(errors, 'sex', sex);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!weight.ok || weight.value === null || !sodium.ok || sodium.value === null) {
    return { ok: false, errors };
  }

  const female = (sex.ok ? sex.value : 'male') === 'female';
  const { totalBodyWaterL, freeWaterDeficitL } = calculateFreeWaterDeficit({
    weightKg: weight.value,
    sodium: sodium.value,
    female,
  });

  if (!Number.isFinite(freeWaterDeficitL)) {
    return { ok: false, errors: { sodium: 'invalidResultError' } };
  }

  const roundedDeficit = Math.round(freeWaterDeficitL * 10) / 10;
  const roundedTbw = Math.round(totalBodyWaterL * 10) / 10;
  const warnings: TranslationKey[] = sodium.value <= FREE_WATER_TARGET_SODIUM ? ['freeWaterDeficitSodiumWarning'] : [];

  return {
    ok: true,
    metrics: [
      { id: 'fwd', labelKey: 'metricFreeWaterDeficit', value: roundedDeficit.toFixed(1), unit: 'L', primary: true },
      { id: 'tbw', labelKey: 'metricTbw', value: roundedTbw.toFixed(1), unit: 'L' },
    ],
    working: `TBW = ${weight.value} kg × ${female ? 0.5 : 0.6} = ${roundedTbw.toFixed(1)} L; FWD = ${roundedTbw.toFixed(1)} × (${sodium.value} ÷ 140 − 1) = ${roundedDeficit.toFixed(1)} L`,
    interpretationKey: 'freeWaterDeficitInterpretation',
    warnings,
    data: { freeWaterDeficitL: roundedDeficit, totalBodyWaterL: roundedTbw },
  };
}

export const freeWaterDeficitCalculator: CalculatorDefinition = {
  id: 'free-water-deficit',
  slug: 'free-water-deficit',
  categoryKey: 'nephrology',
  titleKey: 'freeWaterDeficitTitle',
  descriptionKey: 'freeWaterDeficitDescription',
  fields,
  formula: 'FWD (L) = TBW × (Na / 140 − 1), TBW = weight × 0.6 [male] or 0.5 [female]',
  formulaDescriptionKey: 'freeWaterDeficitFormulaDescription',
  interpretationKey: 'freeWaterDeficitInterpretation',
  clinicalNoteKey: 'freeWaterDeficitClinicalNote',
  source: 'Free-water deficit based on estimated total body water (0.6 male, 0.5 female).',
  calculate,
};
