import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';
import { CREATININE_UMOL_PER_MGDL } from './egfrCkdEpi';

export interface CockcroftGaultInput {
  age: number;
  female: boolean;
  weightKg: number;
  /** Serum creatinine in mg/dL. */
  scrMgDl: number;
}

/**
 * Pure Cockcroft-Gault estimated creatinine clearance (mL/min). This is not an
 * eGFR and is not normalised to body surface area.
 */
export function calculateCockcroftGault({
  age,
  female,
  weightKg,
  scrMgDl,
}: CockcroftGaultInput): number {
  const base = ((140 - age) * weightKg) / (72 * scrMgDl);
  return female ? base * 0.85 : base;
}

const fields: readonly CalculatorField[] = [
  {
    id: 'age',
    labelKey: 'labelAge',
    unit: 'years',
    placeholder: '65',
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
    id: 'weight',
    labelKey: 'labelWeight',
    unit: 'kg',
    placeholder: '70',
    min: 0,
    step: 0.1,
    inputMode: 'decimal',
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
  const weight = validateNumberField(values.weight, { required: true, min: 0, exclusiveMin: true });
  const creatinine = validateNumberField(values.creatinine, {
    required: true,
    min: 0,
    exclusiveMin: true,
  });
  const sex = validateSelectField(values.sex, ['male', 'female']);
  const unit = validateSelectField(values.creatinineUnit, ['mgdl', 'umol']);

  assignError(errors, 'age', age);
  assignError(errors, 'weight', weight);
  assignError(errors, 'creatinine', creatinine);
  assignError(errors, 'sex', sex);
  assignError(errors, 'creatinineUnit', unit);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (
    !age.ok || age.value === null ||
    !weight.ok || weight.value === null ||
    !creatinine.ok || creatinine.value === null
  ) {
    return { ok: false, errors };
  }

  const isUmol = (unit.ok ? unit.value : 'mgdl') === 'umol';
  const scrMgDl = isUmol ? creatinine.value / CREATININE_UMOL_PER_MGDL : creatinine.value;

  if (scrMgDl <= 0 || scrMgDl > 50) {
    return { ok: false, errors: { creatinine: 'creatinineOutOfRangeError' } };
  }

  const female = (sex.ok ? sex.value : 'male') === 'female';
  const crcl = calculateCockcroftGault({
    age: age.value,
    female,
    weightKg: weight.value,
    scrMgDl,
  });

  if (!Number.isFinite(crcl) || crcl <= 0) {
    return { ok: false, errors: { creatinine: 'invalidResultError' } };
  }

  const rounded = Math.round(crcl);
  const warnings: TranslationKey[] = age.value < 18 ? ['cgAgeWarning'] : [];

  return {
    ok: true,
    metrics: [{ id: 'crcl', labelKey: 'metricCrcl', value: String(rounded), unit: 'mL/min', primary: true }],
    working: `((140 − ${age.value}) × ${weight.value} kg) ÷ (72 × ${scrMgDl.toFixed(2)} mg/dL)${female ? ' × 0.85' : ''} = ${rounded} mL/min`,
    interpretationKey: 'cgInterpretation',
    warnings,
    data: { crcl: rounded, scrMgDl },
  };
}

export const cockcroftGaultCalculator: CalculatorDefinition = {
  id: 'cockcroft-gault',
  slug: 'cockcroft-gault',
  categoryKey: 'nephrology',
  titleKey: 'cgTitle',
  descriptionKey: 'cgDescription',
  fields,
  formula: 'CrCl = ((140 − age) × weight) / (72 × Scr) × 0.85 [female]',
  formulaDescriptionKey: 'cgFormulaDescription',
  interpretationKey: 'cgInterpretation',
  clinicalNoteKey: 'cgClinicalNote',
  source: 'Cockcroft-Gault equation (Cockcroft & Gault, 1976).',
  calculate,
};
