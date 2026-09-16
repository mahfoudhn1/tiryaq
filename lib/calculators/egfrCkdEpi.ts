import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';

/** µmol/L per mg/dL for creatinine. */
export const CREATININE_UMOL_PER_MGDL = 88.4;

export const EGFR_EQUATION = 'CKD-EPI 2021 creatinine, race-free';

export interface EgfrInput {
  age: number;
  female: boolean;
  /** Serum creatinine in mg/dL. */
  scrMgDl: number;
}

/** Pure 2021 CKD-EPI creatinine eGFR (mL/min/1.73 m²), race-free. */
export function calculateEgfr({ age, female, scrMgDl }: EgfrInput): number {
  const kappa = female ? 0.7 : 0.9;
  const alpha = female ? -0.241 : -0.302;
  const ratio = scrMgDl / kappa;
  const egfr =
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, age) *
    (female ? 1.012 : 1);
  return egfr;
}

export function ckdStageKey(egfr: number): TranslationKey {
  if (egfr >= 90) return 'ckdStageG1';
  if (egfr >= 60) return 'ckdStageG2';
  if (egfr >= 45) return 'ckdStageG3a';
  if (egfr >= 30) return 'ckdStageG3b';
  if (egfr >= 15) return 'ckdStageG4';
  return 'ckdStageG5';
}

const fields: readonly CalculatorField[] = [
  {
    id: 'age',
    labelKey: 'labelAge',
    unit: 'years',
    placeholder: '50',
    min: 1,
    max: 120,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'sex',
    type: 'select',
    labelKey: 'labelSex',
    showOptionValue: false,
    options: [
      { value: 'male', labelKey: 'sexMale' },
      { value: 'female', labelKey: 'sexFemale' },
    ],
  },
  {
    id: 'creatinine',
    labelKey: 'labelSerumCreatinine',
    placeholder: '1.0',
    min: 0,
    step: 0.01,
    inputMode: 'decimal',
  },
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
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const age = validateNumberField(values.age, { required: true, min: 1, max: 120 });
  const creatinine = validateNumberField(values.creatinine, {
    required: true,
    min: 0,
    exclusiveMin: true,
  });
  const sex = validateSelectField(values.sex, ['male', 'female']);
  const unit = validateSelectField(values.creatinineUnit, ['mgdl', 'umol']);

  assignError(errors, 'age', age);
  assignError(errors, 'creatinine', creatinine);
  assignError(errors, 'sex', sex);
  assignError(errors, 'creatinineUnit', unit);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!age.ok || age.value === null || !creatinine.ok || creatinine.value === null) {
    return { ok: false, errors };
  }

  const isUmol = (unit.ok ? unit.value : 'mgdl') === 'umol';
  const scrMgDl = isUmol ? creatinine.value / CREATININE_UMOL_PER_MGDL : creatinine.value;

  if (scrMgDl <= 0 || scrMgDl > 50) {
    return { ok: false, errors: { creatinine: 'creatinineOutOfRangeError' } };
  }

  const female = (sex.ok ? sex.value : 'male') === 'female';
  const egfrValue = calculateEgfr({ age: age.value, female, scrMgDl });
  if (!Number.isFinite(egfrValue) || egfrValue <= 0) {
    return { ok: false, errors: { creatinine: 'invalidResultError' } };
  }

  const rounded = Math.round(egfrValue);
  const stage = ckdStageKey(rounded);
  const warnings: TranslationKey[] = age.value < 18 ? ['egfrAgeWarning'] : [];

  return {
    ok: true,
    metrics: [
      { id: 'egfr', labelKey: 'metricEgfr', value: String(rounded), unit: 'mL/min/1.73 m²', primary: true },
      { id: 'stage', labelKey: 'labelCkdStage', value: '', valueKey: stage },
      { id: 'equation', labelKey: 'labelEquation', value: '', valueKey: 'egfrEquationName' },
    ],
    working: `Scr ${scrMgDl.toFixed(2)} mg/dL (${isUmol ? `${creatinine.value} µmol/L ÷ 88.4` : 'as entered'}) → eGFR ${rounded} mL/min/1.73 m²`,
    interpretationKey: 'egfrInterpretation',
    warnings,
    data: { egfr: rounded, scrMgDl },
  };
}

export const egfrCkdEpiCalculator: CalculatorDefinition = {
  id: 'egfr-ckd-epi',
  slug: 'egfr-ckd-epi',
  categoryKey: 'nephrology',
  titleKey: 'egfrTitle',
  descriptionKey: 'egfrDescription',
  fields,
  formula: 'eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.200 × 0.9938^age × 1.012 [female]',
  formulaDescriptionKey: 'egfrFormulaDescription',
  interpretationKey: 'egfrInterpretation',
  clinicalNoteKey: 'egfrClinicalNote',
  source: 'CKD-EPI 2021 creatinine equation without race (Inker et al., NEJM 2021).',
  calculate,
};
