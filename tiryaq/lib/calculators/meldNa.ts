import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import { assignError, validateNumberField, validateSelectField } from './validation';

const YES_NO: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'yes' },
  { value: '0', labelKey: 'no' },
];

const MELD_NA_EQUATION = 'MELD-Na (OPTN/UNOS, 2016)';

/** Sodium bounds and score cap used by the OPTN MELD-Na allocation score. */
export const MELD_NA_SODIUM_MIN = 125;
export const MELD_NA_SODIUM_MAX = 137;
export const MELD_NA_CREATININE_CAP = 4;
export const MELD_NA_SCORE_CAP = 40;

export interface MeldNaInput {
  bilirubinMgDl: number;
  inr: number;
  creatinineMgDl: number;
  sodiumMeqL: number;
  dialysis: boolean;
}

export interface MeldNaResult {
  meld: number;
  meldNa: number;
}

function clampLab(value: number): number {
  return value < 1 ? 1 : value;
}

/** Pure MELD-Na calculation following the current OPTN/UNOS limits. */
export function calculateMeldNa(input: MeldNaInput): MeldNaResult {
  const bilirubin = clampLab(input.bilirubinMgDl);
  const inr = clampLab(input.inr);
  const creatinine = input.dialysis
    ? MELD_NA_CREATININE_CAP
    : Math.min(clampLab(input.creatinineMgDl), MELD_NA_CREATININE_CAP);

  const meldRaw = 3.78 * Math.log(bilirubin) + 11.2 * Math.log(inr) + 9.57 * Math.log(creatinine) + 6.43;
  const meld = Math.round(meldRaw);

  const sodium = Math.min(Math.max(input.sodiumMeqL, MELD_NA_SODIUM_MIN), MELD_NA_SODIUM_MAX);
  const delta = MELD_NA_SODIUM_MAX - sodium;
  const meldNaRaw = meld + 1.32 * delta - 0.033 * meld * delta;
  const meldNa = Math.min(Math.round(meldNaRaw), MELD_NA_SCORE_CAP);

  return { meld, meldNa };
}

const fields: readonly CalculatorField[] = [
  { id: 'bilirubin', labelKey: 'childPughBilirubin', unit: 'mg/dL', placeholder: '2.0', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'inr', labelKey: 'childPughInr', placeholder: '1.5', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'creatinine', labelKey: 'meldNaCreatinine', unit: 'mg/dL', placeholder: '1.2', min: 0, step: 0.01, inputMode: 'decimal' },
  { id: 'sodium', labelKey: 'meldNaSodium', unit: 'mEq/L', placeholder: '135', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'dialysis', type: 'select', labelKey: 'meldNaDialysis', options: YES_NO },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const bilirubin = validateNumberField(values.bilirubin, { required: true, min: 0, exclusiveMin: true });
  const inr = validateNumberField(values.inr, { required: true, min: 0, exclusiveMin: true });
  const creatinine = validateNumberField(values.creatinine, { required: true, min: 0, exclusiveMin: true });
  const sodium = validateNumberField(values.sodium, { required: true, min: 0, exclusiveMin: true });
  const dialysis = validateSelectField(values.dialysis, ['1', '0']);

  assignError(errors, 'bilirubin', bilirubin);
  assignError(errors, 'inr', inr);
  assignError(errors, 'creatinine', creatinine);
  assignError(errors, 'sodium', sodium);
  assignError(errors, 'dialysis', dialysis);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !bilirubin.ok || bilirubin.value === null ||
    !inr.ok || inr.value === null ||
    !creatinine.ok || creatinine.value === null ||
    !sodium.ok || sodium.value === null
  ) {
    return { ok: false, errors };
  }

  const dialysisYes = (dialysis.ok ? dialysis.value : '0') === '1';
  const { meld, meldNa } = calculateMeldNa({
    bilirubinMgDl: bilirubin.value,
    inr: inr.value,
    creatinineMgDl: creatinine.value,
    sodiumMeqL: sodium.value,
    dialysis: dialysisYes,
  });

  if (!Number.isFinite(meldNa)) {
    return { ok: false, errors: { bilirubin: 'invalidResultError' } };
  }

  const clampedSodium = Math.min(Math.max(sodium.value, MELD_NA_SODIUM_MIN), MELD_NA_SODIUM_MAX);

  return {
    ok: true,
    metrics: [
      { id: 'meldNa', labelKey: 'meldNaTotal', value: String(meldNa), primary: true },
      { id: 'meld', labelKey: 'meldNaMeld', value: String(meld) },
      { id: 'equation', labelKey: 'labelEquation', value: '', valueKey: 'meldNaEquationName' },
    ],
    working: `MELD = 3.78×ln(${clampLab(bilirubin.value)}) + 11.2×ln(${clampLab(inr.value)}) + 9.57×ln(${dialysisYes ? MELD_NA_CREATININE_CAP : Math.min(clampLab(creatinine.value), MELD_NA_CREATININE_CAP)}) + 6.43 = ${meld}; MELD-Na = MELD + 1.32×(137 − ${clampedSodium}) − 0.033×MELD×(137 − ${clampedSodium}) = ${meldNa}`,
    interpretationKey: 'meldNaInterpretation',
    data: { score: meldNa, meld },
  };
}

export const meldNaCalculator: CalculatorDefinition = {
  id: 'meld-na',
  slug: 'meld-na',
  categoryKey: 'clinicalScores',
  titleKey: 'meldNaTitle',
  descriptionKey: 'meldNaDescription',
  fields,
  formula: 'MELD-Na = MELD + 1.32×(137 − Na) − 0.033×MELD×(137 − Na)',
  formulaDescriptionKey: 'meldNaFormulaDescription',
  interpretationKey: 'meldNaInterpretation',
  clinicalNoteKey: 'meldNaClinicalNote',
  source: `${MELD_NA_EQUATION}. Lab values below 1 set to 1; creatinine capped at 4; sodium bound to 125–137; score capped at 40.`,
  calculate,
};
