import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField } from './validation';

export type QtcFormula = 'bazett' | 'fridericia';
export type QtcSex = 'male' | 'female';

/** Sensible upper bounds to catch obvious data-entry mistakes. */
export const QTC_MAX_MS = 1000;
export const QTC_MAX_HEART_RATE = 400;

const REQUIRED_FIELD_ERROR = 'valueRequiredError';
const INVALID_OPTION_ERROR = 'invalidSelectionError';
const QT_EXCEEDS_MAX_ERROR = 'qtExceedsMaxError';
const HEART_RATE_EXCEEDS_MAX_ERROR = 'heartRateExceedsMaxError';
const INVALID_RESULT_ERROR = 'qtcInvalidResultError';

export interface QtcInput {
  qtMs: number;
  heartRate: number;
  formula: QtcFormula;
}

export interface QtcResult {
  /** Corrected QT interval in milliseconds. */
  qtC: number;
  /** RR interval in seconds (60 / heart rate). */
  rr: number;
  formula: QtcFormula;
}

/**
 * Pure QTc calculation. Bazett divides QT by the square root of RR; Fridericia
 * divides QT by the cube root of RR, where RR = 60 / heart rate in seconds.
 * QT is in milliseconds throughout, so no unit conversion is required.
 */
export function calculateQTc({ qtMs, heartRate, formula }: QtcInput): QtcResult {
  const rr = 60 / heartRate;
  const exponent = formula === 'fridericia' ? 1 / 3 : 1 / 2;
  const qtC = qtMs / Math.pow(rr, exponent);
  return { qtC, rr, formula };
}

/**
 * Interpretation is deliberately conservative and separated from the maths.
 * Thresholds are commonly cited reference values, not diagnostic cut-offs.
 */
export function interpretQtc(qtCMs: number, sex: QtcSex | undefined): TranslationKey {
  if (qtCMs >= 500) return 'qtcInterpretationMarkedlyProlonged';
  if (qtCMs >= 470) return 'qtcInterpretationProlonged';
  if (qtCMs >= 460) return 'qtcInterpretationBorderline';
  if (qtCMs >= 450) {
    return sex === 'female' ? 'qtcInterpretationNormalFemale' : 'qtcInterpretationBorderline';
  }
  if (sex === 'female') return 'qtcInterpretationNormalFemale';
  if (sex === 'male') return 'qtcInterpretationNormalMale';
  return 'qtcInterpretationNormal';
}

function isFormula(value: string): value is QtcFormula {
  return value === 'bazett' || value === 'fridericia';
}

function isSex(value: string): value is QtcSex {
  return value === 'male' || value === 'female';
}

const fields: readonly CalculatorField[] = [
  {
    id: 'qt',
    labelKey: 'qtInterval',
    unit: 'ms',
    placeholder: '400',
    min: 0,
    max: QTC_MAX_MS,
    step: 1,
    inputMode: 'numeric',
    required: true,
  },
  {
    id: 'heartRate',
    labelKey: 'heartRate',
    unit: 'bpm',
    placeholder: '75',
    min: 0,
    max: QTC_MAX_HEART_RATE,
    step: 1,
    inputMode: 'numeric',
    required: true,
  },
  {
    id: 'formula',
    type: 'select',
    labelKey: 'correctionFormula',
    defaultValue: 'bazett',
    required: true,
    showOptionValue: false,
    options: [
      { value: 'bazett', labelKey: 'formulaBazett' },
      { value: 'fridericia', labelKey: 'formulaFridericia' },
    ],
  },
  {
    id: 'sex',
    type: 'select',
    labelKey: 'patientSex',
    required: false,
    showOptionValue: false,
    options: [
      { value: 'male', labelKey: 'sexMale' },
      { value: 'female', labelKey: 'sexFemale' },
    ],
  },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const qt = validateNumberField(values.qt, {
    required: true,
    min: 0,
    exclusiveMin: true,
    max: QTC_MAX_MS,
    maxError: QT_EXCEEDS_MAX_ERROR,
  });
  const heartRate = validateNumberField(values.heartRate, {
    required: true,
    min: 0,
    exclusiveMin: true,
    max: QTC_MAX_HEART_RATE,
    maxError: HEART_RATE_EXCEEDS_MAX_ERROR,
  });

  assignError(errors, 'qt', qt);
  assignError(errors, 'heartRate', heartRate);

  const formulaValue = values.formula ?? '';
  if (formulaValue === '') {
    errors.formula = REQUIRED_FIELD_ERROR;
  } else if (!isFormula(formulaValue)) {
    errors.formula = INVALID_OPTION_ERROR;
  }

  const sexValue = values.sex ?? '';
  if (sexValue !== '' && !isSex(sexValue)) {
    errors.sex = INVALID_OPTION_ERROR;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!qt.ok || qt.value === null || !heartRate.ok || heartRate.value === null) {
    return { ok: false, errors };
  }

  const formula: QtcFormula = isFormula(formulaValue) ? formulaValue : 'bazett';
  const { qtC, rr } = calculateQTc({ qtMs: qt.value, heartRate: heartRate.value, formula });

  if (!Number.isFinite(qtC) || qtC <= 0) {
    return { ok: false, errors: { qt: INVALID_RESULT_ERROR } };
  }

  const roundedQtc = Math.round(qtC);
  const roundedRr = Math.round(rr * 100) / 100;
  const rootSymbol = formula === 'fridericia' ? '∛' : '√';

  return {
    ok: true,
    metrics: [
      { id: 'qtc', labelKey: 'correctedQt', value: String(roundedQtc), unit: 'ms', primary: true },
      { id: 'rr', labelKey: 'rrInterval', value: roundedRr.toFixed(2), unit: 's' },
      {
        id: 'formula',
        labelKey: 'correctionFormula',
        value: '',
        valueKey: formula === 'fridericia' ? 'formulaFridericia' : 'formulaBazett',
      },
    ],
    working: `RR = 60 ÷ ${heartRate.value} = ${roundedRr.toFixed(2)} s; QTc = ${qt.value} ÷ ${rootSymbol}${roundedRr.toFixed(2)} = ${roundedQtc} ms`,
    interpretationKey: interpretQtc(roundedQtc, isSex(sexValue) ? sexValue : undefined),
    data: { qtcMs: roundedQtc, rrSeconds: roundedRr },
  };
}

export const qtcCalculator: CalculatorDefinition = {
  id: 'qtc',
  slug: 'qtc',
  categoryKey: 'cardiology',
  titleKey: 'qtcCalculator',
  descriptionKey: 'qtcDescription',
  fields,
  formula: 'QTc = QT ÷ √RR (Bazett)   ·   QTc = QT ÷ ∛RR (Fridericia)',
  formulaDescriptionKey: 'qtcFormulaDescription',
  interpretationKey: 'qtcInterpretationNormal',
  clinicalNoteKey: 'qtcClinicalNote',
  source: 'Bazett HC (1920); Fridericia LS (1920). Popular correction formulas for the QT interval.',
  calculate,
};
