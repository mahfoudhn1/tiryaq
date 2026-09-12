import type { CalculationOutcome, CalculatorDefinition, CalculatorErrors } from './types';

const REQUIRED_FIELD_ERROR = 'valueRequiredError';
const INVALID_NUMBER_ERROR = 'invalidNumberError';
const POSITIVE_VALUE_ERROR = 'mustBePositiveError';
const DBP_EXCEEDS_SBP_ERROR = 'dbpExceedsSbpError';

function parseField(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateMap(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const sbp = parseField(values.sbp);
  const dbp = parseField(values.dbp);

  if (values.sbp === undefined || values.sbp.trim() === '') errors.sbp = REQUIRED_FIELD_ERROR;
  else if (sbp === null) errors.sbp = INVALID_NUMBER_ERROR;
  else if (sbp <= 0) errors.sbp = POSITIVE_VALUE_ERROR;

  if (values.dbp === undefined || values.dbp.trim() === '') errors.dbp = REQUIRED_FIELD_ERROR;
  else if (dbp === null) errors.dbp = INVALID_NUMBER_ERROR;
  else if (dbp <= 0) errors.dbp = POSITIVE_VALUE_ERROR;

  if (Object.keys(errors).length > 0 || sbp === null || dbp === null) {
    return { ok: false, errors };
  }

  if (dbp > sbp) {
    return { ok: false, errors: { dbp: DBP_EXCEEDS_SBP_ERROR } };
  }

  const map = (sbp + 2 * dbp) / 3;
  const rounded = Math.round((map + Number.EPSILON) * 10) / 10;

  return {
    ok: true,
    metrics: [
      {
        id: 'map',
        labelKey: 'meanArterialPressureShort',
        value: rounded.toFixed(1),
        unit: 'mmHg',
        primary: true,
      },
    ],
    working: `(${sbp} + 2 × ${dbp}) / 3 = ${rounded.toFixed(1)} mmHg`,
  };
}

export const mapCalculator: CalculatorDefinition = {
  id: 'map',
  slug: 'map',
  categoryKey: 'emergencyAndTrauma',
  titleKey: 'meanArterialPressure',
  descriptionKey: 'mapDescription',
  fields: [
    {
      id: 'sbp',
      labelKey: 'systolicBloodPressure',
      unit: 'mmHg',
      placeholder: '120',
      min: 0,
      step: 1,
      inputMode: 'numeric',
    },
    {
      id: 'dbp',
      labelKey: 'diastolicBloodPressure',
      unit: 'mmHg',
      placeholder: '80',
      min: 0,
      step: 1,
      inputMode: 'numeric',
    },
  ],
  formula: 'MAP = (SBP + 2 × DBP) / 3',
  formulaDescriptionKey: 'mapFormulaDescription',
  interpretationKey: 'mapInterpretation',
  source: 'Standard haemodynamic relationship: MAP = (SBP + 2 × DBP) / 3.',
  calculate: calculateMap,
};
