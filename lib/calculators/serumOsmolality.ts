import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import { assignError, validateNumberField, validateSelectField } from './validation';

/** mg/dL per mmol/L for glucose. */
export const GLUCOSE_MGDL_PER_MMOL = 18;
/** mg/dL BUN per mmol/L urea (BUN = urea mmol/L × 2.8). */
export const BUN_MGDL_PER_MMOL_UREA = 2.8;

export interface OsmolalityInput {
  sodium: number;
  /** Glucose in mg/dL. */
  glucoseMgDl: number;
  /** BUN in mg/dL. */
  bunMgDl: number;
}

/** Pure calculated serum osmolality (mOsm/kg): 2×Na + glucose/18 + BUN/2.8. */
export function calculateOsmolality({ sodium, glucoseMgDl, bunMgDl }: OsmolalityInput): number {
  return 2 * sodium + glucoseMgDl / GLUCOSE_MGDL_PER_MMOL + bunMgDl / BUN_MGDL_PER_MMOL_UREA;
}

const fields: readonly CalculatorField[] = [
  { id: 'sodium', labelKey: 'labelSodium', unit: 'mEq/L', placeholder: '140', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'glucose', labelKey: 'labelGlucose', placeholder: '90', min: 0, step: 1, inputMode: 'decimal' },
  {
    id: 'glucoseUnit',
    type: 'select',
    labelKey: 'labelGlucoseUnit',
    defaultValue: 'mgdl',
    showOptionValue: false,
    options: [
      { value: 'mgdl', labelKey: 'unitMgDl' },
      { value: 'mmol', labelKey: 'unitMmolL' },
    ],
  },
  { id: 'bun', labelKey: 'labelBun', placeholder: '14', min: 0, step: 1, inputMode: 'decimal' },
  {
    id: 'bunUnit',
    type: 'select',
    labelKey: 'labelBunUnit',
    defaultValue: 'mgdl',
    showOptionValue: false,
    options: [
      { value: 'mgdl', labelKey: 'unitMgDlBun' },
      { value: 'mmol', labelKey: 'unitMmolLUrea' },
    ],
  },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const sodium = validateNumberField(values.sodium, { required: true, min: 0, exclusiveMin: true });
  const glucose = validateNumberField(values.glucose, { required: true, min: 0 });
  const bun = validateNumberField(values.bun, { required: true, min: 0 });
  const glucoseUnit = validateSelectField(values.glucoseUnit, ['mgdl', 'mmol']);
  const bunUnit = validateSelectField(values.bunUnit, ['mgdl', 'mmol']);

  assignError(errors, 'sodium', sodium);
  assignError(errors, 'glucose', glucose);
  assignError(errors, 'bun', bun);
  assignError(errors, 'glucoseUnit', glucoseUnit);
  assignError(errors, 'bunUnit', bunUnit);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!sodium.ok || sodium.value === null || !glucose.ok || glucose.value === null || !bun.ok || bun.value === null) {
    return { ok: false, errors };
  }

  const glucoseMgDl = (glucoseUnit.ok ? glucoseUnit.value : 'mgdl') === 'mmol'
    ? glucose.value * GLUCOSE_MGDL_PER_MMOL
    : glucose.value;
  const bunMgDl = (bunUnit.ok ? bunUnit.value : 'mgdl') === 'mmol'
    ? bun.value * BUN_MGDL_PER_MMOL_UREA
    : bun.value;

  const osmolality = calculateOsmolality({ sodium: sodium.value, glucoseMgDl, bunMgDl });
  if (!Number.isFinite(osmolality) || osmolality <= 0) {
    return { ok: false, errors: { sodium: 'invalidResultError' } };
  }

  const rounded = Math.round(osmolality);

  return {
    ok: true,
    metrics: [{ id: 'osmolality', labelKey: 'metricOsmolality', value: String(rounded), unit: 'mOsm/kg', primary: true }],
    working: `2 × ${sodium.value} + ${Math.round(glucoseMgDl)} ÷ 18 + ${Math.round(bunMgDl)} ÷ 2.8 = ${rounded} mOsm/kg`,
    interpretationKey: 'osmolalityInterpretation',
    data: { osmolalityMOsmPerKg: rounded },
  };
}

export const serumOsmolalityCalculator: CalculatorDefinition = {
  id: 'serum-osmolality',
  slug: 'serum-osmolality',
  categoryKey: 'nephrology',
  titleKey: 'osmolalityTitle',
  descriptionKey: 'osmolalityDescription',
  fields,
  formula: 'Calculated osmolality = 2 × Na + glucose/18 + BUN/2.8',
  formulaDescriptionKey: 'osmolalityFormulaDescription',
  interpretationKey: 'osmolalityInterpretation',
  clinicalNoteKey: 'osmolalityClinicalNote',
  source: 'Calculated serum osmolality: 2 × Na + glucose/18 + BUN/2.8 (all in mg/dL for glucose and BUN).',
  calculate,
};
