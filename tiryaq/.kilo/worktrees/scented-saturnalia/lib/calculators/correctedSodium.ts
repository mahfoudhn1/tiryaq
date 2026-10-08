import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';

/** mg/dL per mmol/L for glucose. */
export const GLUCOSE_MGDL_PER_MMOL = 18;

export type SodiumCorrectionFactor = 1.6 | 2.4;

export interface CorrectedSodiumInput {
  measuredSodium: number;
  /** Glucose in mg/dL. */
  glucoseMgDl: number;
  factor: SodiumCorrectionFactor;
}

/** Pure corrected sodium for hyperglycaemia (mEq/L). */
export function calculateCorrectedSodium({
  measuredSodium,
  glucoseMgDl,
  factor,
}: CorrectedSodiumInput): number {
  return measuredSodium + factor * ((glucoseMgDl - 100) / 100);
}

const fields: readonly CalculatorField[] = [
  {
    id: 'sodium',
    labelKey: 'labelMeasuredSodium',
    unit: 'mEq/L',
    placeholder: '130',
    min: 0,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'glucose',
    labelKey: 'labelGlucose',
    placeholder: '400',
    min: 0,
    step: 1,
    inputMode: 'decimal',
  },
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
  {
    id: 'factor',
    type: 'select',
    labelKey: 'labelCorrectionFactor',
    showOptionValue: false,
    options: [
      { value: '1.6', labelKey: 'sodiumFactor16' },
      { value: '2.4', labelKey: 'sodiumFactor24' },
    ],
  },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const sodium = validateNumberField(values.sodium, { required: true, min: 0, exclusiveMin: true });
  const glucose = validateNumberField(values.glucose, { required: true, min: 0, exclusiveMin: true });
  const glucoseUnit = validateSelectField(values.glucoseUnit, ['mgdl', 'mmol']);
  const factor = validateSelectField(values.factor, ['1.6', '2.4']);

  assignError(errors, 'sodium', sodium);
  assignError(errors, 'glucose', glucose);
  assignError(errors, 'glucoseUnit', glucoseUnit);
  assignError(errors, 'factor', factor);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!sodium.ok || sodium.value === null || !glucose.ok || glucose.value === null) {
    return { ok: false, errors };
  }

  const isMmol = (glucoseUnit.ok ? glucoseUnit.value : 'mgdl') === 'mmol';
  const glucoseMgDl = isMmol ? glucose.value * GLUCOSE_MGDL_PER_MMOL : glucose.value;
  const selectedFactor: SodiumCorrectionFactor = (factor.ok ? factor.value : '1.6') === '2.4' ? 2.4 : 1.6;
  const corrected = calculateCorrectedSodium({
    measuredSodium: sodium.value,
    glucoseMgDl,
    factor: selectedFactor,
  });

  if (!Number.isFinite(corrected)) {
    return { ok: false, errors: { sodium: 'invalidResultError' } };
  }

  const rounded = Math.round(corrected * 10) / 10;
  const factorKey: TranslationKey = selectedFactor === 2.4 ? 'sodiumFactor24' : 'sodiumFactor16';

  return {
    ok: true,
    metrics: [
      { id: 'correctedNa', labelKey: 'metricCorrectedSodium', value: rounded.toFixed(1), unit: 'mEq/L', primary: true },
      { id: 'measuredNa', labelKey: 'metricMeasuredSodium', value: String(sodium.value), unit: 'mEq/L' },
      { id: 'factor', labelKey: 'labelCorrectionFactor', value: '', valueKey: factorKey },
    ],
    working: `Corrected Na = ${sodium.value} + ${selectedFactor} × (${Math.round(glucoseMgDl)} − 100) ÷ 100 = ${rounded.toFixed(1)} mEq/L`,
    interpretationKey: 'correctedSodiumInterpretation',
    data: { correctedSodium: rounded, measuredSodium: sodium.value, glucoseMgDl, factor: selectedFactor },
  };
}

export const correctedSodiumCalculator: CalculatorDefinition = {
  id: 'corrected-sodium',
  slug: 'corrected-sodium',
  categoryKey: 'nephrology',
  titleKey: 'correctedSodiumTitle',
  descriptionKey: 'correctedSodiumDescription',
  fields,
  formula: 'Corrected Na = measured Na + factor × (glucose mg/dL − 100) / 100',
  formulaDescriptionKey: 'correctedSodiumFormulaDescription',
  interpretationKey: 'correctedSodiumInterpretation',
  clinicalNoteKey: 'correctedSodiumClinicalNote',
  source: 'Sodium correction for hyperglycaemia; selectable 1.6 or 2.4 mEq/L per 100 mg/dL glucose.',
  calculate,
};
