import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';

export type AscvdSex = 'male' | 'female';
export type AscvdRace = 'africanAmerican' | 'whiteOther';

export const ASCVD_EQUATION = '2013 ACC/AHA Pooled Cohort Equations';

/** Validated population limits for the pooled cohort equations. */
export const ASCVD_LIMITS = {
  ageMin: 40,
  ageMax: 79,
  totalCholMin: 130,
  totalCholMax: 320,
  hdlMin: 20,
  hdlMax: 100,
  sbpMin: 90,
  sbpMax: 200,
} as const;

export interface AscvdInput {
  age: number;
  sex: AscvdSex;
  race: AscvdRace;
  totalChol: number;
  hdl: number;
  sbp: number;
  bpTreated: boolean;
  diabetes: boolean;
  smoker: boolean;
}

export interface AscvdResult {
  riskPercent: number;
  equation: string;
}

interface AscvdModel {
  mean: number;
  s10: number;
  sum: (input: AscvdInput) => number;
}

const ln = Math.log;

function model(sex: AscvdSex, race: AscvdRace): AscvdModel {
  const smoker = (i: AscvdInput) => (i.smoker ? 1 : 0);
  const diabetes = (i: AscvdInput) => (i.diabetes ? 1 : 0);

  if (sex === 'male' && race === 'whiteOther') {
    return {
      mean: 61.18,
      s10: 0.9144,
      sum: (i) =>
        12.344 * ln(i.age) +
        11.853 * ln(i.totalChol) -
        2.664 * ln(i.age) * ln(i.totalChol) -
        7.99 * ln(i.hdl) +
        1.769 * ln(i.age) * ln(i.hdl) +
        (i.bpTreated ? 1.797 : 1.764) * ln(i.sbp) +
        7.837 * smoker(i) -
        1.795 * ln(i.age) * smoker(i) +
        0.658 * diabetes(i),
    };
  }

  if (sex === 'male' && race === 'africanAmerican') {
    return {
      mean: 19.54,
      s10: 0.8954,
      sum: (i) =>
        2.469 * ln(i.age) +
        0.302 * ln(i.totalChol) -
        0.307 * ln(i.hdl) +
        (i.bpTreated ? 1.916 : 1.809) * ln(i.sbp) +
        0.549 * smoker(i) +
        0.645 * diabetes(i),
    };
  }

  if (sex === 'female' && race === 'whiteOther') {
    return {
      mean: -29.18,
      s10: 0.9665,
      sum: (i) =>
        -29.799 * ln(i.age) +
        4.884 * ln(i.age) * ln(i.age) +
        13.54 * ln(i.totalChol) -
        3.114 * ln(i.age) * ln(i.totalChol) -
        13.578 * ln(i.hdl) +
        3.149 * ln(i.age) * ln(i.hdl) +
        (i.bpTreated ? 2.019 : 1.957) * ln(i.sbp) +
        7.574 * smoker(i) -
        1.665 * ln(i.age) * smoker(i) +
        0.661 * diabetes(i),
    };
  }

  return {
    mean: 86.61,
    s10: 0.9533,
    sum: (i) =>
      17.114 * ln(i.age) +
      0.94 * ln(i.totalChol) -
      18.92 * ln(i.hdl) +
      4.475 * ln(i.age) * ln(i.hdl) +
      (i.bpTreated
        ? (29.291 - 6.432 * ln(i.age)) * ln(i.sbp)
        : (27.82 - 6.087 * ln(i.age)) * ln(i.sbp)) +
      0.691 * smoker(i) +
      0.874 * diabetes(i),
  };
}

/**
 * Pure 10-year ASCVD risk using the 2013 ACC/AHA pooled cohort equations.
 * Callers must validate the input ranges first; this function does not clamp
 * or substitute values outside the validated population.
 */
export function calculateAscvd(input: AscvdInput): AscvdResult {
  const { mean, s10, sum } = model(input.sex, input.race);
  const individual = sum(input);
  const risk = 1 - Math.pow(s10, Math.exp(individual - mean));
  return { riskPercent: risk * 100, equation: ASCVD_EQUATION };
}

const AGE_RANGE_ERROR = 'ascvdAgeRangeError';
const TOTAL_CHOL_RANGE_ERROR = 'ascvdTotalCholRangeError';
const HDL_RANGE_ERROR = 'ascvdHdlRangeError';
const SBP_RANGE_ERROR = 'ascvdSbpRangeError';

const fields: readonly CalculatorField[] = [
  {
    id: 'age',
    labelKey: 'ascvdAge',
    unit: 'years',
    placeholder: '55',
    min: ASCVD_LIMITS.ageMin,
    max: ASCVD_LIMITS.ageMax,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'sex',
    type: 'select',
    labelKey: 'ascvdSex',
    showOptionValue: false,
    options: [
      { value: 'male', labelKey: 'sexMale' },
      { value: 'female', labelKey: 'sexFemale' },
    ],
  },
  {
    id: 'race',
    type: 'select',
    labelKey: 'ascvdRace',
    showOptionValue: false,
    options: [
      { value: 'whiteOther', labelKey: 'ascvdRaceWhiteOther' },
      { value: 'africanAmerican', labelKey: 'ascvdRaceAfricanAmerican' },
    ],
  },
  {
    id: 'totalChol',
    labelKey: 'ascvdTotalChol',
    unit: 'mg/dL',
    placeholder: '200',
    min: ASCVD_LIMITS.totalCholMin,
    max: ASCVD_LIMITS.totalCholMax,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'hdl',
    labelKey: 'ascvdHdl',
    unit: 'mg/dL',
    placeholder: '50',
    min: ASCVD_LIMITS.hdlMin,
    max: ASCVD_LIMITS.hdlMax,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'sbp',
    labelKey: 'ascvdSbp',
    unit: 'mmHg',
    placeholder: '120',
    min: ASCVD_LIMITS.sbpMin,
    max: ASCVD_LIMITS.sbpMax,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'bpTreated',
    type: 'select',
    labelKey: 'ascvdBpTreated',
    options: [
      { value: '1', labelKey: 'yes' },
      { value: '0', labelKey: 'no' },
    ],
  },
  {
    id: 'diabetes',
    type: 'select',
    labelKey: 'ascvdDiabetes',
    options: [
      { value: '1', labelKey: 'yes' },
      { value: '0', labelKey: 'no' },
    ],
  },
  {
    id: 'smoker',
    type: 'select',
    labelKey: 'ascvdSmoker',
    options: [
      { value: '1', labelKey: 'yes' },
      { value: '0', labelKey: 'no' },
    ],
  },
];

function yes(value: string | undefined): boolean {
  return value === '1';
}

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const age = validateNumberField(values.age, {
    required: true,
    min: ASCVD_LIMITS.ageMin,
    max: ASCVD_LIMITS.ageMax,
    minError: AGE_RANGE_ERROR,
    maxError: AGE_RANGE_ERROR,
  });
  const totalChol = validateNumberField(values.totalChol, {
    required: true,
    min: ASCVD_LIMITS.totalCholMin,
    max: ASCVD_LIMITS.totalCholMax,
    minError: TOTAL_CHOL_RANGE_ERROR,
    maxError: TOTAL_CHOL_RANGE_ERROR,
  });
  const hdl = validateNumberField(values.hdl, {
    required: true,
    min: ASCVD_LIMITS.hdlMin,
    max: ASCVD_LIMITS.hdlMax,
    minError: HDL_RANGE_ERROR,
    maxError: HDL_RANGE_ERROR,
  });
  const sbp = validateNumberField(values.sbp, {
    required: true,
    min: ASCVD_LIMITS.sbpMin,
    max: ASCVD_LIMITS.sbpMax,
    minError: SBP_RANGE_ERROR,
    maxError: SBP_RANGE_ERROR,
  });

  assignError(errors, 'age', age);
  assignError(errors, 'totalChol', totalChol);
  assignError(errors, 'hdl', hdl);
  assignError(errors, 'sbp', sbp);

  const sexResult = validateSelectField(values.sex, ['male', 'female']);
  const raceResult = validateSelectField(values.race, ['whiteOther', 'africanAmerican']);
  const bpTreatedResult = validateSelectField(values.bpTreated, ['1', '0']);
  const diabetesResult = validateSelectField(values.diabetes, ['1', '0']);
  const smokerResult = validateSelectField(values.smoker, ['1', '0']);

  assignError(errors, 'sex', sexResult);
  assignError(errors, 'race', raceResult);
  assignError(errors, 'bpTreated', bpTreatedResult);
  assignError(errors, 'diabetes', diabetesResult);
  assignError(errors, 'smoker', smokerResult);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (
    !age.ok || age.value === null ||
    !totalChol.ok || totalChol.value === null ||
    !hdl.ok || hdl.value === null ||
    !sbp.ok || sbp.value === null ||
    !sexResult.ok || sexResult.value === null ||
    !raceResult.ok || raceResult.value === null
  ) {
    return { ok: false, errors };
  }

  const { riskPercent } = calculateAscvd({
    age: age.value,
    sex: sexResult.value as AscvdSex,
    race: raceResult.value as AscvdRace,
    totalChol: totalChol.value,
    hdl: hdl.value,
    sbp: sbp.value,
    bpTreated: yes(values.bpTreated),
    diabetes: yes(values.diabetes),
    smoker: yes(values.smoker),
  });

  if (!Number.isFinite(riskPercent) || riskPercent < 0 || riskPercent > 100) {
    return { ok: false, errors: { age: 'invalidResultError' } };
  }

  const rounded = Math.round(riskPercent * 10) / 10;
  const interpretationKey: TranslationKey =
    rounded >= 20
      ? 'ascvdInterpretationHigh'
      : rounded >= 7.5
        ? 'ascvdInterpretationIntermediate'
        : rounded >= 5
          ? 'ascvdInterpretationBorderline'
          : 'ascvdInterpretationLow';

  return {
    ok: true,
    metrics: [
      { id: 'risk', labelKey: 'ascvdRisk', value: rounded.toFixed(1), unit: '%', primary: true },
      { id: 'equation', labelKey: 'ascvdEquation', value: '', valueKey: 'ascvdEquationName' },
    ],
    working: `10-year ASCVD risk = ${rounded.toFixed(1)}% (${ASCVD_EQUATION})`,
    interpretationKey,
    data: { riskPercent: rounded },
  };
}

export const ascvdCalculator: CalculatorDefinition = {
  id: 'ascvd',
  slug: 'ascvd',
  categoryKey: 'cardiology',
  titleKey: 'ascvdScore',
  descriptionKey: 'ascvdDescription',
  fields,
  formula: '10-year ASCVD risk = 1 − S₁₀^exp(ΣβX − mean)',
  formulaDescriptionKey: 'ascvdFormulaDescription',
  interpretationKey: 'ascvdInterpretationLow',
  clinicalNoteKey: 'ascvdClinicalNote',
  source: `${ASCVD_EQUATION} (Goff et al., 2013).`,
  calculate,
};
