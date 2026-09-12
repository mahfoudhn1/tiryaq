import type { CalculationOutcome, CalculatorDefinition, CalculatorErrors } from './types';

const REQUIRED_FIELD_ERROR = 'valueRequiredError';
const INVALID_NUMBER_ERROR = 'invalidNumberError';
const POSITIVE_VALUE_ERROR = 'mustBePositiveError';

function parseField(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateShockIndex(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};
  const heartRate = parseField(values.heartRate);
  const systolicBloodPressure = parseField(values.systolicBloodPressure);

  if (values.heartRate === undefined || values.heartRate.trim() === '') {
    errors.heartRate = REQUIRED_FIELD_ERROR;
  } else if (heartRate === null) {
    errors.heartRate = INVALID_NUMBER_ERROR;
  } else if (heartRate <= 0) {
    errors.heartRate = POSITIVE_VALUE_ERROR;
  }

  if (
    values.systolicBloodPressure === undefined ||
    values.systolicBloodPressure.trim() === ''
  ) {
    errors.systolicBloodPressure = REQUIRED_FIELD_ERROR;
  } else if (systolicBloodPressure === null) {
    errors.systolicBloodPressure = INVALID_NUMBER_ERROR;
  } else if (systolicBloodPressure <= 0) {
    errors.systolicBloodPressure = POSITIVE_VALUE_ERROR;
  }

  if (
    Object.keys(errors).length > 0 ||
    heartRate === null ||
    systolicBloodPressure === null ||
    systolicBloodPressure <= 0
  ) {
    return { ok: false, errors };
  }

  const shockIndex = heartRate / systolicBloodPressure;
  const rounded = Math.round((shockIndex + Number.EPSILON) * 100) / 100;

  return {
    ok: true,
    metrics: [{ id: 'shockIndex', labelKey: 'shockIndexShort', value: rounded.toFixed(2), primary: true }],
    working: `${heartRate} ÷ ${systolicBloodPressure} = ${rounded.toFixed(2)}`,
    data: { shockIndex: rounded },
  };
}

export const shockIndexCalculator: CalculatorDefinition = {
  id: 'shock-index',
  slug: 'shock-index',
  categoryKey: 'emergencyAndTrauma',
  titleKey: 'shockIndex',
  descriptionKey: 'shockIndexDescription',
  fields: [
    { id: 'heartRate', labelKey: 'heartRate', unit: 'bpm', placeholder: '100', min: 0, step: 1, inputMode: 'numeric' },
    { id: 'systolicBloodPressure', labelKey: 'systolicBloodPressure', unit: 'mmHg', placeholder: '120', min: 0, step: 1, inputMode: 'numeric' },
  ],
  formula: 'SI = Heart Rate / Systolic Blood Pressure',
  formulaDescriptionKey: 'shockIndexFormulaDescription',
  interpretationKey: 'shockIndexInterpretation',
  clinicalNoteKey: 'shockIndexClinicalNote',
  source: 'Standard Shock Index: heart rate divided by systolic blood pressure.',
  calculate: calculateShockIndex,
};