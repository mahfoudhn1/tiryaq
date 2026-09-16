import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorMetric,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField } from './validation';

/** Reference midpoint for the albumin correction, in g/dL. */
const ALBUMIN_REFERENCE = 4.0;

export interface AnionGapInput {
  sodium: number;
  chloride: number;
  bicarbonate: number;
  /** Albumin in g/dL, when available. */
  albumin?: number;
}

export interface AnionGapResult {
  anionGap: number;
  correctedAnionGap?: number;
}

/** Pure anion gap, with an optional albumin-corrected value. */
export function calculateAnionGap({
  sodium,
  chloride,
  bicarbonate,
  albumin,
}: AnionGapInput): AnionGapResult {
  const anionGap = sodium - (chloride + bicarbonate);
  if (albumin === undefined) {
    return { anionGap };
  }
  return {
    anionGap,
    correctedAnionGap: anionGap + 2.5 * (ALBUMIN_REFERENCE - albumin),
  };
}

const fields: readonly CalculatorField[] = [
  {
    id: 'sodium',
    labelKey: 'labelSodium',
    unit: 'mEq/L',
    placeholder: '140',
    min: 0,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'chloride',
    labelKey: 'labelChloride',
    unit: 'mEq/L',
    placeholder: '104',
    min: 0,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'bicarbonate',
    labelKey: 'labelBicarbonate',
    unit: 'mEq/L',
    placeholder: '24',
    min: 0,
    step: 1,
    inputMode: 'numeric',
  },
  {
    id: 'albumin',
    labelKey: 'labelAlbuminOptional',
    unit: 'g/dL',
    placeholder: '4.0',
    min: 0,
    max: 10,
    step: 0.1,
    inputMode: 'decimal',
  },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const sodium = validateNumberField(values.sodium, { required: true, min: 0, exclusiveMin: true });
  const chloride = validateNumberField(values.chloride, { required: true, min: 0 });
  const bicarbonate = validateNumberField(values.bicarbonate, { required: true, min: 0 });
  const albumin = validateNumberField(values.albumin, { min: 0, max: 10 });

  assignError(errors, 'sodium', sodium);
  assignError(errors, 'chloride', chloride);
  assignError(errors, 'bicarbonate', bicarbonate);
  assignError(errors, 'albumin', albumin);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (
    !sodium.ok || sodium.value === null ||
    !chloride.ok || chloride.value === null ||
    !bicarbonate.ok || bicarbonate.value === null
  ) {
    return { ok: false, errors };
  }

  const albuminValue = albumin.ok ? albumin.value : null;
  const { anionGap, correctedAnionGap } = calculateAnionGap({
    sodium: sodium.value,
    chloride: chloride.value,
    bicarbonate: bicarbonate.value,
    albumin: albuminValue ?? undefined,
  });

  const roundedAg = Math.round(anionGap * 10) / 10;
  const interpretationKey: TranslationKey =
    roundedAg > 12 ? 'anionGapInterpretationElevated' : 'anionGapInterpretationNormal';

  const metrics: CalculatorMetric[] = [
    { id: 'ag', labelKey: 'metricAnionGap', value: roundedAg.toFixed(1), unit: 'mEq/L', primary: true },
  ];
  if (correctedAnionGap !== undefined) {
    metrics.push({
      id: 'correctedAg',
      labelKey: 'metricCorrectedAnionGap',
      value: (Math.round(correctedAnionGap * 10) / 10).toFixed(1),
      unit: 'mEq/L',
    });
  }

  const working =
    correctedAnionGap !== undefined
      ? `AG = ${sodium.value} − (${chloride.value} + ${bicarbonate.value}) = ${roundedAg.toFixed(1)}; corrected AG = ${roundedAg.toFixed(1)} + 2.5 × (4.0 − ${albuminValue}) = ${(Math.round(correctedAnionGap * 10) / 10).toFixed(1)} mEq/L`
      : `AG = ${sodium.value} − (${chloride.value} + ${bicarbonate.value}) = ${roundedAg.toFixed(1)} mEq/L`;

  return {
    ok: true,
    metrics,
    working,
    interpretationKey,
    data:
      correctedAnionGap !== undefined
        ? { anionGap: roundedAg, correctedAnionGap: Math.round(correctedAnionGap * 10) / 10 }
        : { anionGap: roundedAg },
  };
}

export const anionGapCalculator: CalculatorDefinition = {
  id: 'anion-gap',
  slug: 'anion-gap',
  categoryKey: 'nephrology',
  titleKey: 'anionGapTitle',
  descriptionKey: 'anionGapDescription',
  fields,
  formula: 'AG = Na − (Cl + HCO₃)',
  formulaDescriptionKey: 'anionGapFormulaDescription',
  interpretationKey: 'anionGapInterpretationNormal',
  clinicalNoteKey: 'anionGapClinicalNote',
  source: 'Anion gap; albumin correction: corrected AG = AG + 2.5 × (4.0 − albumin g/dL).',
  calculate,
};
