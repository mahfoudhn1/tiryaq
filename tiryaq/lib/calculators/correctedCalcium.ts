import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import { assignError, validateNumberField, validateSelectField } from './validation';

/** mg/dL per mmol/L for calcium. */
export const CALCIUM_MGDL_PER_MMOL = 4.0;
/** Reference midpoint for the albumin correction, in g/dL. */
const ALBUMIN_REFERENCE = 4.0;

export interface CorrectedCalciumInput {
  /** Measured calcium in mg/dL. */
  calciumMgDl: number;
  /** Albumin in g/dL. */
  albuminGDl: number;
}

/** Pure albumin-corrected calcium in mg/dL. */
export function calculateCorrectedCalcium({
  calciumMgDl,
  albuminGDl,
}: CorrectedCalciumInput): number {
  return calciumMgDl + 0.8 * (ALBUMIN_REFERENCE - albuminGDl);
}

const fields: readonly CalculatorField[] = [
  {
    id: 'calcium',
    labelKey: 'labelTotalCalcium',
    placeholder: '9.0',
    min: 0,
    step: 0.1,
    inputMode: 'decimal',
  },
  {
    id: 'calciumUnit',
    type: 'select',
    labelKey: 'labelCalciumUnit',
    defaultValue: 'mgdl',
    showOptionValue: false,
    options: [
      { value: 'mgdl', labelKey: 'unitMgDl' },
      { value: 'mmol', labelKey: 'unitMmolL' },
    ],
  },
  {
    id: 'albumin',
    labelKey: 'labelAlbumin',
    placeholder: '4.0',
    min: 0,
    step: 0.1,
    inputMode: 'decimal',
  },
  {
    id: 'albuminUnit',
    type: 'select',
    labelKey: 'labelAlbuminUnit',
    defaultValue: 'gdl',
    showOptionValue: false,
    options: [
      { value: 'gdl', labelKey: 'unitGPerDl' },
      { value: 'gl', labelKey: 'unitGPerL' },
    ],
  },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const calcium = validateNumberField(values.calcium, { required: true, min: 0, exclusiveMin: true });
  const albumin = validateNumberField(values.albumin, { required: true, min: 0, exclusiveMin: true });
  const calciumUnit = validateSelectField(values.calciumUnit, ['mgdl', 'mmol']);
  const albuminUnit = validateSelectField(values.albuminUnit, ['gdl', 'gl']);

  assignError(errors, 'calcium', calcium);
  assignError(errors, 'albumin', albumin);
  assignError(errors, 'calciumUnit', calciumUnit);
  assignError(errors, 'albuminUnit', albuminUnit);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  if (!calcium.ok || calcium.value === null || !albumin.ok || albumin.value === null) {
    return { ok: false, errors };
  }

  const isMmol = (calciumUnit.ok ? calciumUnit.value : 'mgdl') === 'mmol';
  const isGl = (albuminUnit.ok ? albuminUnit.value : 'gdl') === 'gl';

  const calciumMgDl = isMmol ? calcium.value * CALCIUM_MGDL_PER_MMOL : calcium.value;
  const albuminGDl = isGl ? albumin.value / 10 : albumin.value;

  if (calciumMgDl <= 0 || calciumMgDl > 20) {
    return { ok: false, errors: { calcium: 'calciumOutOfRangeError' } };
  }
  if (albuminGDl <= 0 || albuminGDl > 10) {
    return { ok: false, errors: { albumin: 'albuminOutOfRangeError' } };
  }

  const correctedMgDl = calculateCorrectedCalcium({ calciumMgDl, albuminGDl });

  if (!Number.isFinite(correctedMgDl) || correctedMgDl <= 0) {
    return { ok: false, errors: { calcium: 'invalidResultError' } };
  }

  const displayFactor = isMmol ? 1 / CALCIUM_MGDL_PER_MMOL : 1;
  const displayUnit = isMmol ? 'mmol/L' : 'mg/dL';
  const decimals = isMmol ? 2 : 1;
  const measuredDisplay = (calciumMgDl * displayFactor).toFixed(decimals);
  const correctedDisplay = (correctedMgDl * displayFactor).toFixed(decimals);

  return {
    ok: true,
    metrics: [
      { id: 'correctedCa', labelKey: 'metricCorrectedCalcium', value: correctedDisplay, unit: displayUnit, primary: true },
      { id: 'measuredCa', labelKey: 'metricMeasuredCalcium', value: measuredDisplay, unit: displayUnit },
    ],
    working: `Corrected Ca = ${(calciumMgDl).toFixed(1)} + 0.8 × (4.0 − ${albuminGDl.toFixed(1)}) = ${correctedMgDl.toFixed(1)} mg/dL`,
    interpretationKey: 'correctedCalciumInterpretation',
    data: { measuredCalciumMgDl: calciumMgDl, correctedCalciumMgDl: correctedMgDl },
  };
}

export const correctedCalciumCalculator: CalculatorDefinition = {
  id: 'corrected-calcium',
  slug: 'corrected-calcium',
  categoryKey: 'nephrology',
  titleKey: 'correctedCalciumTitle',
  descriptionKey: 'correctedCalciumDescription',
  fields,
  formula: 'Corrected Ca (mg/dL) = measured Ca + 0.8 × (4.0 − albumin g/dL)',
  formulaDescriptionKey: 'correctedCalciumFormulaDescription',
  interpretationKey: 'correctedCalciumInterpretation',
  clinicalNoteKey: 'correctedCalciumClinicalNote',
  source: 'Albumin-corrected calcium (Payne et al., 1973).',
  calculate,
};
