import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import { assignError, validateNumberField } from './validation';

export interface FenaInput {
  serumSodium: number;
  urineSodium: number;
  serumCreatinine: number;
  urineCreatinine: number;
}

/** Pure fractional excretion of sodium (%). */
export function calculateFena({
  serumSodium,
  urineSodium,
  serumCreatinine,
  urineCreatinine,
}: FenaInput): number {
  return ((urineSodium * serumCreatinine) / (serumSodium * urineCreatinine)) * 100;
}

const fields: readonly CalculatorField[] = [
  { id: 'serumSodium', labelKey: 'labelSerumSodium', unit: 'mEq/L', placeholder: '140', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'urineSodium', labelKey: 'labelUrineSodium', unit: 'mEq/L', placeholder: '20', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'serumCreatinine', labelKey: 'labelSerumCreatinine', unit: 'mg/dL', placeholder: '1.0', min: 0, step: 0.01, inputMode: 'decimal' },
  { id: 'urineCreatinine', labelKey: 'labelUrineCreatinine', unit: 'mg/dL', placeholder: '100', min: 0, step: 1, inputMode: 'numeric' },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const serumSodium = validateNumberField(values.serumSodium, { required: true, min: 0, exclusiveMin: true });
  const urineSodium = validateNumberField(values.urineSodium, { required: true, min: 0 });
  const serumCreatinine = validateNumberField(values.serumCreatinine, { required: true, min: 0, exclusiveMin: true });
  const urineCreatinine = validateNumberField(values.urineCreatinine, { required: true, min: 0, exclusiveMin: true });

  assignError(errors, 'serumSodium', serumSodium);
  assignError(errors, 'urineSodium', urineSodium);
  assignError(errors, 'serumCreatinine', serumCreatinine);
  assignError(errors, 'urineCreatinine', urineCreatinine);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (
    !serumSodium.ok || serumSodium.value === null ||
    !urineSodium.ok || urineSodium.value === null ||
    !serumCreatinine.ok || serumCreatinine.value === null ||
    !urineCreatinine.ok || urineCreatinine.value === null
  ) {
    return { ok: false, errors };
  }

  const fena = calculateFena({
    serumSodium: serumSodium.value,
    urineSodium: urineSodium.value,
    serumCreatinine: serumCreatinine.value,
    urineCreatinine: urineCreatinine.value,
  });

  if (!Number.isFinite(fena) || fena < 0) {
    return { ok: false, errors: { urineCreatinine: 'invalidResultError' } };
  }

  const rounded = Math.round(fena * 100) / 100;

  return {
    ok: true,
    metrics: [{ id: 'fena', labelKey: 'metricFena', value: rounded.toFixed(2), unit: '%', primary: true }],
    working: `(urine Na ${urineSodium.value} × serum Cr ${serumCreatinine.value}) ÷ (serum Na ${serumSodium.value} × urine Cr ${urineCreatinine.value}) × 100 = ${rounded.toFixed(2)}%`,
    interpretationKey: 'fenaInterpretation',
    data: { fenaPercent: rounded },
  };
}

export const fenaCalculator: CalculatorDefinition = {
  id: 'fena',
  slug: 'fena',
  categoryKey: 'nephrology',
  titleKey: 'fenaTitle',
  descriptionKey: 'fenaDescription',
  fields,
  formula: 'FeNa (%) = (urine Na × serum Cr) / (serum Na × urine Cr) × 100',
  formulaDescriptionKey: 'fenaFormulaDescription',
  interpretationKey: 'fenaInterpretation',
  clinicalNoteKey: 'fenaClinicalNote',
  source: 'Fractional excretion of sodium.',
  calculate,
};
