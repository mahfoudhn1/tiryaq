import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import { assignError, validateNumberField, validateSelectField } from './validation';
import {
  BUN_MGDL_PER_MMOL_UREA,
  GLUCOSE_MGDL_PER_MMOL,
  calculateOsmolality,
} from './serumOsmolality';

const fields: readonly CalculatorField[] = [
  { id: 'measuredOsmolality', labelKey: 'labelMeasuredOsmolality', unit: 'mOsm/kg', placeholder: '290', min: 0, step: 1, inputMode: 'decimal' },
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

  const measured = validateNumberField(values.measuredOsmolality, { required: true, min: 0, exclusiveMin: true });
  const sodium = validateNumberField(values.sodium, { required: true, min: 0, exclusiveMin: true });
  const glucose = validateNumberField(values.glucose, { required: true, min: 0 });
  const bun = validateNumberField(values.bun, { required: true, min: 0 });
  const glucoseUnit = validateSelectField(values.glucoseUnit, ['mgdl', 'mmol']);
  const bunUnit = validateSelectField(values.bunUnit, ['mgdl', 'mmol']);

  assignError(errors, 'measuredOsmolality', measured);
  assignError(errors, 'sodium', sodium);
  assignError(errors, 'glucose', glucose);
  assignError(errors, 'bun', bun);
  assignError(errors, 'glucoseUnit', glucoseUnit);
  assignError(errors, 'bunUnit', bunUnit);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (
    !measured.ok || measured.value === null ||
    !sodium.ok || sodium.value === null ||
    !glucose.ok || glucose.value === null ||
    !bun.ok || bun.value === null
  ) {
    return { ok: false, errors };
  }

  const glucoseMgDl = (glucoseUnit.ok ? glucoseUnit.value : 'mgdl') === 'mmol'
    ? glucose.value * GLUCOSE_MGDL_PER_MMOL
    : glucose.value;
  const bunMgDl = (bunUnit.ok ? bunUnit.value : 'mgdl') === 'mmol'
    ? bun.value * BUN_MGDL_PER_MMOL_UREA
    : bun.value;

  const calculated = calculateOsmolality({ sodium: sodium.value, glucoseMgDl, bunMgDl });
  const gap = measured.value - calculated;

  if (!Number.isFinite(gap)) {
    return { ok: false, errors: { measuredOsmolality: 'invalidResultError' } };
  }

  const roundedGap = Math.round(gap);
  const roundedCalc = Math.round(calculated);

  return {
    ok: true,
    metrics: [
      { id: 'gap', labelKey: 'metricOsmolarGap', value: String(roundedGap), unit: 'mOsm/kg', primary: true },
      { id: 'calculated', labelKey: 'metricOsmolality', value: String(roundedCalc), unit: 'mOsm/kg' },
      { id: 'measured', labelKey: 'metricMeasuredOsmolality', value: String(measured.value), unit: 'mOsm/kg' },
    ],
    working: `Calculated osmolality = 2 × ${sodium.value} + ${Math.round(glucoseMgDl)} ÷ 18 + ${Math.round(bunMgDl)} ÷ 2.8 = ${roundedCalc} mOsm/kg; gap = ${measured.value} − ${roundedCalc} = ${roundedGap} mOsm/kg`,
    interpretationKey: 'osmolarGapInterpretation',
    data: { osmolarGap: roundedGap, calculatedOsmolality: roundedCalc, measuredOsmolality: measured.value },
  };
}

export const osmolarGapCalculator: CalculatorDefinition = {
  id: 'osmolar-gap',
  slug: 'osmolar-gap',
  categoryKey: 'nephrology',
  titleKey: 'osmolarGapTitle',
  descriptionKey: 'osmolarGapDescription',
  fields,
  formula: 'Osmolar gap = measured osmolality − calculated osmolality',
  formulaDescriptionKey: 'osmolarGapFormulaDescription',
  interpretationKey: 'osmolarGapInterpretation',
  clinicalNoteKey: 'osmolarGapClinicalNote',
  source: 'Osmolar gap using calculated serum osmolality (2 × Na + glucose/18 + BUN/2.8).',
  calculate,
};
