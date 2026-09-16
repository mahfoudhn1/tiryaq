import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';

export type News2Spo2Scale = '1' | '2';

export interface News2Input {
  respiratoryRate: number;
  spo2: number;
  spo2Scale: News2Spo2Scale;
  onSupplementalOxygen: boolean;
  temperature: number;
  systolicBp: number;
  heartRate: number;
  consciousness: 'alert' | 'cvpu';
}

export interface News2Result {
  total: number;
  scores: Record<string, number>;
  anyThree: boolean;
}

function rrScore(value: number): number {
  if (value <= 8) return 3;
  if (value <= 11) return 1;
  if (value <= 20) return 0;
  if (value <= 24) return 2;
  return 3;
}

function spo2Scale1Score(value: number): number {
  if (value <= 91) return 3;
  if (value <= 93) return 2;
  if (value <= 95) return 1;
  return 0;
}

function spo2Scale2Score(value: number, onOxygen: boolean): number {
  if (value <= 83) return 3;
  if (value <= 85) return 2;
  if (value <= 87) return 1;
  if (value <= 92) return 0;
  if (!onOxygen) return 0;
  if (value <= 94) return 1;
  if (value <= 96) return 2;
  return 3;
}

function systolicScore(value: number): number {
  if (value <= 90) return 3;
  if (value <= 100) return 2;
  if (value <= 110) return 1;
  if (value <= 219) return 0;
  return 3;
}

function heartRateScore(value: number): number {
  if (value <= 40) return 3;
  if (value <= 50) return 1;
  if (value <= 90) return 0;
  if (value <= 110) return 1;
  if (value <= 130) return 2;
  return 3;
}

function temperatureScore(value: number): number {
  if (value <= 35.0) return 3;
  if (value <= 36.0) return 1;
  if (value <= 38.0) return 0;
  if (value <= 39.0) return 1;
  return 2;
}

/** Pure NEWS2 score with the published component weights. */
export function calculateNews2(input: News2Input): News2Result {
  const scores: Record<string, number> = {
    respiratoryRate: rrScore(input.respiratoryRate),
    spo2:
      input.spo2Scale === '2'
        ? spo2Scale2Score(input.spo2, input.onSupplementalOxygen)
        : spo2Scale1Score(input.spo2),
    supplementalOxygen: input.onSupplementalOxygen ? 2 : 0,
    temperature: temperatureScore(input.temperature),
    systolicBp: systolicScore(input.systolicBp),
    heartRate: heartRateScore(input.heartRate),
    consciousness: input.consciousness === 'cvpu' ? 3 : 0,
  };
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const anyThree = Object.values(scores).some((value) => value === 3);
  return { total, scores, anyThree };
}

const SCALE_OPTIONS: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'news2Scale1' },
  { value: '2', labelKey: 'news2Scale2' },
];

const fields: readonly CalculatorField[] = [
  { id: 'respiratoryRate', labelKey: 'news2RespiratoryRate', unit: '/min', placeholder: '16', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'spo2', labelKey: 'news2Spo2', unit: '%', placeholder: '97', min: 0, max: 100, step: 1, inputMode: 'numeric' },
  { id: 'spo2Scale', type: 'select', labelKey: 'news2Spo2Scale', defaultValue: '1', showOptionValue: false, options: SCALE_OPTIONS },
  {
    id: 'supplementalOxygen',
    type: 'select',
    labelKey: 'news2SupplementalOxygen',
    defaultValue: 'air',
    showOptionValue: false,
    options: [
      { value: 'air', labelKey: 'news2OxygenAir' },
      { value: 'oxygen', labelKey: 'news2Oxygen' },
    ],
  },
  { id: 'temperature', labelKey: 'sirsTemperature', unit: '°C', placeholder: '37.0', min: 25, max: 45, step: 0.1, inputMode: 'decimal' },
  { id: 'systolicBp', labelKey: 'gbsSbp', unit: 'mmHg', placeholder: '120', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'heartRate', labelKey: 'labelHeartRate', unit: 'bpm', placeholder: '80', min: 0, step: 1, inputMode: 'numeric' },
  {
    id: 'consciousness',
    type: 'select',
    labelKey: 'news2Consciousness',
    defaultValue: 'alert',
    showOptionValue: false,
    options: [
      { value: 'alert', labelKey: 'news2ConsciousnessAlert' },
      { value: 'cvpu', labelKey: 'news2ConsciousnessCvpu' },
    ],
  },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const respiratoryRate = validateNumberField(values.respiratoryRate, { required: true, min: 0, max: 100 });
  const spo2 = validateNumberField(values.spo2, { required: true, min: 0, max: 100 });
  const spo2Scale = validateSelectField(values.spo2Scale, ['1', '2']);
  const oxygen = validateSelectField(values.supplementalOxygen, ['air', 'oxygen']);
  const temperature = validateNumberField(values.temperature, { required: true, min: 25, max: 45 });
  const systolicBp = validateNumberField(values.systolicBp, { required: true, min: 0, exclusiveMin: true });
  const heartRate = validateNumberField(values.heartRate, { required: true, min: 0, exclusiveMin: true });
  const consciousness = validateSelectField(values.consciousness, ['alert', 'cvpu']);

  assignError(errors, 'respiratoryRate', respiratoryRate);
  assignError(errors, 'spo2', spo2);
  assignError(errors, 'spo2Scale', spo2Scale);
  assignError(errors, 'supplementalOxygen', oxygen);
  assignError(errors, 'temperature', temperature);
  assignError(errors, 'systolicBp', systolicBp);
  assignError(errors, 'heartRate', heartRate);
  assignError(errors, 'consciousness', consciousness);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !respiratoryRate.ok || respiratoryRate.value === null ||
    !spo2.ok || spo2.value === null ||
    !temperature.ok || temperature.value === null ||
    !systolicBp.ok || systolicBp.value === null ||
    !heartRate.ok || heartRate.value === null
  ) {
    return { ok: false, errors };
  }

  const onOxygen = (oxygen.ok ? oxygen.value : 'air') === 'oxygen';
  const result = calculateNews2({
    respiratoryRate: respiratoryRate.value,
    spo2: spo2.value,
    spo2Scale: ((spo2Scale.ok ? spo2Scale.value : '1') as News2Spo2Scale),
    onSupplementalOxygen: onOxygen,
    temperature: temperature.value,
    systolicBp: systolicBp.value,
    heartRate: heartRate.value,
    consciousness: (consciousness.ok ? consciousness.value : 'alert') === 'cvpu' ? 'cvpu' : 'alert',
  });

  const interpretationKey: TranslationKey =
    result.total >= 7
      ? 'news2InterpretationHigh'
      : result.total >= 5
        ? 'news2InterpretationMedium'
        : result.total >= 1
          ? 'news2InterpretationLow'
          : 'news2InterpretationRoutine';

  const warnings: TranslationKey[] = result.anyThree ? ['news2SingleParameterWarning'] : [];

  const s = result.scores;

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'news2Total', value: String(result.total), primary: true },
      { id: 'rr', labelKey: 'news2RespiratoryRate', value: String(s.respiratoryRate) },
      { id: 'spo2', labelKey: 'news2Spo2', value: String(s.spo2) },
      { id: 'oxygen', labelKey: 'news2SupplementalOxygen', value: String(s.supplementalOxygen) },
      { id: 'temperature', labelKey: 'sirsTemperature', value: String(s.temperature) },
      { id: 'systolicBp', labelKey: 'gbsSbp', value: String(s.systolicBp) },
      { id: 'heartRate', labelKey: 'labelHeartRate', value: String(s.heartRate) },
      { id: 'consciousness', labelKey: 'news2Consciousness', value: String(s.consciousness) },
    ],
    working: `RR ${s.respiratoryRate} + SpO₂ ${s.spo2} + O₂ ${s.supplementalOxygen} + Temp ${s.temperature} + SBP ${s.systolicBp} + HR ${s.heartRate} + ACVPU ${s.consciousness} = ${result.total}`,
    interpretationKey,
    warnings,
    data: { score: result.total },
  };
}

export const news2Calculator: CalculatorDefinition = {
  id: 'news2',
  slug: 'news2',
  categoryKey: 'clinicalScores',
  titleKey: 'news2Title',
  descriptionKey: 'news2Description',
  fields,
  formula: 'NEWS2 = respiratory rate + SpO₂ + supplemental oxygen + temperature + systolic BP + heart rate + consciousness',
  formulaDescriptionKey: 'news2FormulaDescription',
  interpretationKey: 'news2InterpretationRoutine',
  clinicalNoteKey: 'news2ClinicalNote',
  source: 'National Early Warning Score 2 (Royal College of Physicians, 2017).',
  calculate,
};
