import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import { assignError, validateNumberField } from './validation';

export interface FeureaInput {
  serumBun: number;
  urineBun: number;
  serumCreatinine: number;
  urineCreatinine: number;
}

/**
 * Pure fractional excretion of urea (%). Using BUN for both urea terms, or
 * urea for both, gives the same result because the conversion factor cancels.
 */
export function calculateFeurea({
  serumBun,
  urineBun,
  serumCreatinine,
  urineCreatinine,
}: FeureaInput): number {
  return ((urineBun * serumCreatinine) / (serumBun * urineCreatinine)) * 100;
}

const fields: readonly CalculatorField[] = [
  { id: 'serumBun', labelKey: 'labelSerumBun', unit: 'mg/dL', placeholder: '14', min: 0, step: 1, inputMode: 'decimal' },
  { id: 'urineBun', labelKey: 'labelUrineBun', unit: 'mg/dL', placeholder: '300', min: 0, step: 1, inputMode: 'decimal' },
  { id: 'serumCreatinine', labelKey: 'labelSerumCreatinine', unit: 'mg/dL', placeholder: '1.0', min: 0, step: 0.01, inputMode: 'decimal' },
  { id: 'urineCreatinine', labelKey: 'labelUrineCreatinine', unit: 'mg/dL', placeholder: '100', min: 0, step: 1, inputMode: 'decimal' },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const serumBun = validateNumberField(values.serumBun, { required: true, min: 0, exclusiveMin: true });
  const urineBun = validateNumberField(values.urineBun, { required: true, min: 0 });
  const serumCreatinine = validateNumberField(values.serumCreatinine, { required: true, min: 0, exclusiveMin: true });
  const urineCreatinine = validateNumberField(values.urineCreatinine, { required: true, min: 0, exclusiveMin: true });

  assignError(errors, 'serumBun', serumBun);
  assignError(errors, 'urineBun', urineBun);
  assignError(errors, 'serumCreatinine', serumCreatinine);
  assignError(errors, 'urineCreatinine', urineCreatinine);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (
    !serumBun.ok || serumBun.value === null ||
    !urineBun.ok || urineBun.value === null ||
    !serumCreatinine.ok || serumCreatinine.value === null ||
    !urineCreatinine.ok || urineCreatinine.value === null
  ) {
    return { ok: false, errors };
  }

  const feurea = calculateFeurea({
    serumBun: serumBun.value,
    urineBun: urineBun.value,
    serumCreatinine: serumCreatinine.value,
    urineCreatinine: urineCreatinine.value,
  });

  if (!Number.isFinite(feurea) || feurea < 0) {
    return { ok: false, errors: { urineCreatinine: 'invalidResultError' } };
  }

  const rounded = Math.round(feurea * 100) / 100;

  return {
    ok: true,
    metrics: [{ id: 'feurea', labelKey: 'metricFeurea', value: rounded.toFixed(2), unit: '%', primary: true }],
    working: `(urine BUN ${urineBun.value} × serum Cr ${serumCreatinine.value}) ÷ (serum BUN ${serumBun.value} × urine Cr ${urineCreatinine.value}) × 100 = ${rounded.toFixed(2)}%`,
    interpretationKey: 'feureaInterpretation',
    data: { feureaPercent: rounded },
  };
}

export const feureaCalculator: CalculatorDefinition = {
  id: 'feurea',
  slug: 'feurea',
  categoryKey: 'nephrology',
  titleKey: 'feureaTitle',
  descriptionKey: 'feureaDescription',
  fields,
  formula: 'FeUrea (%) = (urine urea × serum Cr) / (serum urea × urine Cr) × 100',
  formulaDescriptionKey: 'feureaFormulaDescription',
  interpretationKey: 'feureaInterpretation',
  clinicalNoteKey: 'feureaClinicalNote',
  source: 'Fractional excretion of urea. BUN may be used for both urea terms because the conversion cancels.',
  calculate,
};
