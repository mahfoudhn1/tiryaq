import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';

const YES_NO: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'yes' },
  { value: '0', labelKey: 'no' },
];

const KILLIP_OPTIONS: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'graceKillipI' },
  { value: '2', labelKey: 'graceKillipII' },
  { value: '3', labelKey: 'graceKillipIII' },
  { value: '4', labelKey: 'graceKillipIV' },
];

export interface GraceInput {
  age: number;
  heartRate: number;
  systolicBp: number;
  /** Creatinine in mg/dL. */
  creatinineMgDl: number;
  killip: 1 | 2 | 3 | 4;
  cardiacArrest: boolean;
  stDeviation: boolean;
  elevatedEnzymes: boolean;
}

export interface GraceResult {
  total: number;
  agePoints: number;
  heartRatePoints: number;
  systolicBpPoints: number;
  creatininePoints: number;
  killipPoints: number;
}

function agePoints(age: number): number {
  if (age < 30) return 0;
  if (age < 40) return 8;
  if (age < 50) return 25;
  if (age < 60) return 41;
  if (age < 70) return 58;
  if (age < 80) return 75;
  if (age < 90) return 91;
  return 100;
}

function heartRatePoints(hr: number): number {
  if (hr < 50) return 0;
  if (hr < 70) return 3;
  if (hr < 90) return 9;
  if (hr < 110) return 15;
  if (hr < 150) return 24;
  if (hr < 200) return 38;
  return 46;
}

function systolicBpPoints(sbp: number): number {
  if (sbp < 80) return 58;
  if (sbp < 100) return 53;
  if (sbp < 120) return 43;
  if (sbp < 140) return 34;
  if (sbp < 160) return 24;
  if (sbp < 200) return 10;
  return 0;
}

function creatininePoints(creatinineMgDl: number): number {
  if (creatinineMgDl < 0.4) return 1;
  if (creatinineMgDl < 0.8) return 4;
  if (creatinineMgDl < 1.2) return 7;
  if (creatinineMgDl < 1.6) return 10;
  if (creatinineMgDl < 2) return 13;
  if (creatinineMgDl < 4) return 21;
  return 28;
}

function killipPoints(killip: 1 | 2 | 3 | 4): number {
  return killip === 1 ? 0 : killip === 2 ? 20 : killip === 3 ? 39 : 59;
}

/** Pure GRACE risk score for in-hospital mortality in acute coronary syndrome. */
export function calculateGrace(input: GraceInput): GraceResult {
  const agePts = agePoints(input.age);
  const heartRatePts = heartRatePoints(input.heartRate);
  const systolicBpPts = systolicBpPoints(input.systolicBp);
  const creatininePts = creatininePoints(input.creatinineMgDl);
  const killipPts = killipPoints(input.killip);
  const total =
    agePts +
    heartRatePts +
    systolicBpPts +
    creatininePts +
    killipPts +
    (input.cardiacArrest ? 39 : 0) +
    (input.stDeviation ? 28 : 0) +
    (input.elevatedEnzymes ? 14 : 0);

  return {
    total,
    agePoints: agePts,
    heartRatePoints: heartRatePts,
    systolicBpPoints: systolicBpPts,
    creatininePoints: creatininePts,
    killipPoints: killipPts,
  };
}

const fields: readonly CalculatorField[] = [
  { id: 'age', labelKey: 'labelAge', unit: 'years', placeholder: '65', min: 0, max: 120, step: 1, inputMode: 'numeric' },
  { id: 'heartRate', labelKey: 'labelHeartRate', unit: 'bpm', placeholder: '80', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'systolicBp', labelKey: 'gbsSbp', unit: 'mmHg', placeholder: '130', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'creatinine', labelKey: 'meldNaCreatinine', placeholder: '1.0', min: 0, step: 0.01, inputMode: 'decimal' },
  {
    id: 'creatinineUnit',
    type: 'select',
    labelKey: 'labelCreatinineUnit',
    defaultValue: 'mgdl',
    showOptionValue: false,
    options: [
      { value: 'mgdl', labelKey: 'unitMgDl' },
      { value: 'umol', labelKey: 'unitUmolL' },
    ],
  },
  { id: 'killip', type: 'select', labelKey: 'graceKillip', showOptionValue: false, options: KILLIP_OPTIONS },
  { id: 'cardiacArrest', type: 'select', labelKey: 'graceCardiacArrest', options: YES_NO },
  { id: 'stDeviation', type: 'select', labelKey: 'graceStDeviation', options: YES_NO },
  { id: 'enzymes', type: 'select', labelKey: 'graceEnzymes', options: YES_NO },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const age = validateNumberField(values.age, { required: true, min: 0, max: 120 });
  const heartRate = validateNumberField(values.heartRate, { required: true, min: 0, exclusiveMin: true });
  const systolicBp = validateNumberField(values.systolicBp, { required: true, min: 0, exclusiveMin: true });
  const creatinine = validateNumberField(values.creatinine, { required: true, min: 0, exclusiveMin: true });
  const creatinineUnit = validateSelectField(values.creatinineUnit, ['mgdl', 'umol']);
  const killip = validateSelectField(values.killip, ['1', '2', '3', '4']);
  const cardiacArrest = validateSelectField(values.cardiacArrest, ['1', '0']);
  const stDeviation = validateSelectField(values.stDeviation, ['1', '0']);
  const enzymes = validateSelectField(values.enzymes, ['1', '0']);

  assignError(errors, 'age', age);
  assignError(errors, 'heartRate', heartRate);
  assignError(errors, 'systolicBp', systolicBp);
  assignError(errors, 'creatinine', creatinine);
  assignError(errors, 'creatinineUnit', creatinineUnit);
  assignError(errors, 'killip', killip);
  assignError(errors, 'cardiacArrest', cardiacArrest);
  assignError(errors, 'stDeviation', stDeviation);
  assignError(errors, 'enzymes', enzymes);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !age.ok || age.value === null ||
    !heartRate.ok || heartRate.value === null ||
    !systolicBp.ok || systolicBp.value === null ||
    !creatinine.ok || creatinine.value === null ||
    !killip.ok || killip.value === null
  ) {
    return { ok: false, errors };
  }

  const isUmol = (creatinineUnit.ok ? creatinineUnit.value : 'mgdl') === 'umol';
  const creatinineMgDl = isUmol ? creatinine.value / 88.4 : creatinine.value;

  const result = calculateGrace({
    age: age.value,
    heartRate: heartRate.value,
    systolicBp: systolicBp.value,
    creatinineMgDl,
    killip: Number(killip.value) as 1 | 2 | 3 | 4,
    cardiacArrest: (cardiacArrest.ok ? cardiacArrest.value : '0') === '1',
    stDeviation: (stDeviation.ok ? stDeviation.value : '0') === '1',
    elevatedEnzymes: (enzymes.ok ? enzymes.value : '0') === '1',
  });

  const interpretationKey: TranslationKey =
    result.total > 140 ? 'graceInterpretationHigh' : result.total >= 109 ? 'graceInterpretationModerate' : 'graceInterpretationLow';

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'graceTotal', value: String(result.total), primary: true },
      { id: 'age', labelKey: 'graceAgeShort', value: String(result.agePoints) },
      { id: 'heartRate', labelKey: 'graceHeartRateShort', value: String(result.heartRatePoints) },
      { id: 'systolicBp', labelKey: 'graceSbpShort', value: String(result.systolicBpPoints) },
      { id: 'creatinine', labelKey: 'graceCreatinineShort', value: String(result.creatininePoints) },
      { id: 'killip', labelKey: 'graceKillipShort', value: String(result.killipPoints) },
    ],
    working: `Age ${result.agePoints} + HR ${result.heartRatePoints} + SBP ${result.systolicBpPoints} + Cr ${result.creatininePoints} + Killip ${result.killipPoints} + Arrest ${(cardiacArrest.ok && cardiacArrest.value) === '1' ? 39 : 0} + ST ${(stDeviation.ok && stDeviation.value) === '1' ? 28 : 0} + Enzymes ${(enzymes.ok && enzymes.value) === '1' ? 14 : 0} = ${result.total}`,
    interpretationKey,
    data: { score: result.total },
  };
}

export const graceCalculator: CalculatorDefinition = {
  id: 'grace',
  slug: 'grace',
  categoryKey: 'clinicalScores',
  titleKey: 'graceTitle',
  descriptionKey: 'graceDescription',
  fields,
  formula: 'GRACE = age + heart rate + systolic BP + creatinine + Killip class + cardiac arrest + ST deviation + enzymes',
  formulaDescriptionKey: 'graceFormulaDescription',
  interpretationKey: 'graceInterpretationLow',
  clinicalNoteKey: 'graceClinicalNote',
  source: 'GRACE risk score (Granger et al., 2003) for in-hospital mortality in acute coronary syndrome.',
  calculate,
};
