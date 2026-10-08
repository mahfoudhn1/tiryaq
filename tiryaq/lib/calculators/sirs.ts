import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import { assignError, validateNumberField } from './validation';

const fields: readonly CalculatorField[] = [
  { id: 'temperature', labelKey: 'sirsTemperature', unit: '°C', placeholder: '37.0', min: 25, max: 45, step: 0.1, inputMode: 'decimal' },
  { id: 'heartRate', labelKey: 'labelHeartRate', unit: 'bpm', placeholder: '80', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'respiratoryRate', labelKey: 'sirsRespiratoryRate', unit: '/min', placeholder: '16', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'wbc', labelKey: 'sirsWbc', unit: '×10³/µL', placeholder: '8', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'bands', labelKey: 'sirsBands', unit: '%', placeholder: '0', min: 0, max: 100, step: 1, inputMode: 'numeric' },
];

interface SirsCriteria {
  temperature: boolean;
  heartRate: boolean;
  respiratoryRate: boolean;
  wbc: boolean;
}

/** Pure SIRS criteria evaluation. Bands are optional and contribute to the WBC criterion. */
export function evaluateSirs(input: {
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  wbc: number;
  bands?: number;
}): SirsCriteria {
  return {
    temperature: input.temperature > 38 || input.temperature < 36,
    heartRate: input.heartRate > 90,
    respiratoryRate: input.respiratoryRate > 20,
    wbc: input.wbc > 12 || input.wbc < 4 || (input.bands !== undefined && input.bands > 10),
  };
}

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const temperature = validateNumberField(values.temperature, { required: true, min: 25, max: 45 });
  const heartRate = validateNumberField(values.heartRate, { required: true, min: 0, exclusiveMin: true });
  const respiratoryRate = validateNumberField(values.respiratoryRate, { required: true, min: 0 });
  const wbc = validateNumberField(values.wbc, { required: true, min: 0, exclusiveMin: true });
  const bands = validateNumberField(values.bands, { min: 0, max: 100 });

  assignError(errors, 'temperature', temperature);
  assignError(errors, 'heartRate', heartRate);
  assignError(errors, 'respiratoryRate', respiratoryRate);
  assignError(errors, 'wbc', wbc);
  assignError(errors, 'bands', bands);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !temperature.ok || temperature.value === null ||
    !heartRate.ok || heartRate.value === null ||
    !respiratoryRate.ok || respiratoryRate.value === null ||
    !wbc.ok || wbc.value === null
  ) {
    return { ok: false, errors };
  }

  const criteria = evaluateSirs({
    temperature: temperature.value,
    heartRate: heartRate.value,
    respiratoryRate: respiratoryRate.value,
    wbc: wbc.value,
    bands: bands.ok && bands.value !== null ? bands.value : undefined,
  });

  const componentPoints: Record<string, number> = {
    temperature: criteria.temperature ? 1 : 0,
    heartRate: criteria.heartRate ? 1 : 0,
    respiratoryRate: criteria.respiratoryRate ? 1 : 0,
    wbc: criteria.wbc ? 1 : 0,
  };
  const total = Object.values(componentPoints).reduce((sum, value) => sum + value, 0);
  const interpretationKey = total >= 2 ? 'sirsInterpretationPresent' : 'sirsInterpretationAbsent';

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'sirsTotal', value: String(total), primary: true },
      { id: 'temperature', labelKey: 'sirsTemperature', value: String(componentPoints.temperature) },
      { id: 'heartRate', labelKey: 'sirsHeartRate', value: String(componentPoints.heartRate) },
      { id: 'respiratoryRate', labelKey: 'sirsRespiratoryRate', value: String(componentPoints.respiratoryRate) },
      { id: 'wbc', labelKey: 'sirsWbc', value: String(componentPoints.wbc) },
    ],
    working: `Temp ${componentPoints.temperature} + HR ${componentPoints.heartRate} + RR ${componentPoints.respiratoryRate} + WBC ${componentPoints.wbc} = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const sirsCalculator: CalculatorDefinition = {
  id: 'sirs',
  slug: 'sirs',
  categoryKey: 'clinicalScores',
  titleKey: 'sirsTitle',
  descriptionKey: 'sirsDescription',
  fields,
  formula: 'SIRS = temperature + heart rate + respiratory rate + WBC (1 point each)',
  formulaDescriptionKey: 'sirsFormulaDescription',
  interpretationKey: 'sirsInterpretationAbsent',
  clinicalNoteKey: 'sirsClinicalNote',
  source: 'SIRS criteria (Bone et al., 1992).',
  calculate,
};
