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

export interface GbsInput {
  /** Urea in mmol/L. */
  ureaMmol: number;
  hemoglobinGDl: number;
  female: boolean;
  systolicBp: number;
  pulse: number;
  melena: boolean;
  syncope: boolean;
  hepaticDisease: boolean;
  cardiacFailure: boolean;
}

export interface GbsResult {
  total: number;
  bunPoints: number;
  hemoglobinPoints: number;
  systolicBpPoints: number;
  pulsePoints: number;
}

/** Pure Glasgow-Blatchford score. Urea is entered in mmol/L. */
export function calculateGbs(input: GbsInput): GbsResult {
  const urea = input.ureaMmol;
  const bunPoints = urea < 6.5 ? 0 : urea < 8 ? 2 : urea < 10 ? 3 : urea < 25 ? 4 : 6;

  const hb = input.hemoglobinGDl;
  const hemoglobinPoints = input.female
    ? hb >= 12 ? 0 : hb >= 10 ? 1 : 6
    : hb >= 13 ? 0 : hb >= 12 ? 1 : hb >= 10 ? 3 : 6;

  const sbp = input.systolicBp;
  const systolicBpPoints = sbp >= 110 ? 0 : sbp >= 100 ? 1 : sbp >= 90 ? 2 : 3;

  const pulsePoints = input.pulse >= 100 ? 1 : 0;
  const melenaPoints = input.melena ? 1 : 0;
  const syncopePoints = input.syncope ? 1 : 0;
  const hepaticPoints = input.hepaticDisease ? 2 : 0;
  const cardiacPoints = input.cardiacFailure ? 2 : 0;

  const total =
    bunPoints + hemoglobinPoints + systolicBpPoints + pulsePoints + melenaPoints + syncopePoints + hepaticPoints + cardiacPoints;

  return { total, bunPoints, hemoglobinPoints, systolicBpPoints, pulsePoints };
}

const fields: readonly CalculatorField[] = [
  { id: 'urea', labelKey: 'gbsBun', placeholder: '6', min: 0, step: 0.1, inputMode: 'decimal' },
  {
    id: 'ureaUnit',
    type: 'select',
    labelKey: 'gbsBunUnit',
    defaultValue: 'mmol',
    showOptionValue: false,
    options: [
      { value: 'mmol', labelKey: 'unitMmolLUrea' },
      { value: 'mgdl', labelKey: 'unitMgDlBun' },
    ],
  },
  { id: 'hemoglobin', labelKey: 'gbsHemoglobin', unit: 'g/dL', placeholder: '13.5', min: 0, step: 0.1, inputMode: 'decimal' },
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
  { id: 'systolicBp', labelKey: 'gbsSbp', unit: 'mmHg', placeholder: '120', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'pulse', labelKey: 'gbsPulse', unit: 'bpm', placeholder: '80', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'melena', type: 'select', labelKey: 'gbsMelena', options: YES_NO },
  { id: 'syncope', type: 'select', labelKey: 'gbsSyncope', options: YES_NO },
  { id: 'hepaticDisease', type: 'select', labelKey: 'gbsHepatic', options: YES_NO },
  { id: 'cardiacFailure', type: 'select', labelKey: 'gbsCardiac', options: YES_NO },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const urea = validateNumberField(values.urea, { required: true, min: 0, exclusiveMin: true });
  const ureaUnit = validateSelectField(values.ureaUnit, ['mmol', 'mgdl']);
  const hemoglobin = validateNumberField(values.hemoglobin, { required: true, min: 0, exclusiveMin: true });
  const sex = validateSelectField(values.sex, ['male', 'female']);
  const systolicBp = validateNumberField(values.systolicBp, { required: true, min: 0, exclusiveMin: true });
  const pulse = validateNumberField(values.pulse, { required: true, min: 0 });
  const melena = validateSelectField(values.melena, ['1', '0']);
  const syncope = validateSelectField(values.syncope, ['1', '0']);
  const hepaticDisease = validateSelectField(values.hepaticDisease, ['1', '0']);
  const cardiacFailure = validateSelectField(values.cardiacFailure, ['1', '0']);

  assignError(errors, 'urea', urea);
  assignError(errors, 'ureaUnit', ureaUnit);
  assignError(errors, 'hemoglobin', hemoglobin);
  assignError(errors, 'sex', sex);
  assignError(errors, 'systolicBp', systolicBp);
  assignError(errors, 'pulse', pulse);
  assignError(errors, 'melena', melena);
  assignError(errors, 'syncope', syncope);
  assignError(errors, 'hepaticDisease', hepaticDisease);
  assignError(errors, 'cardiacFailure', cardiacFailure);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !urea.ok || urea.value === null ||
    !hemoglobin.ok || hemoglobin.value === null ||
    !systolicBp.ok || systolicBp.value === null ||
    !pulse.ok || pulse.value === null
  ) {
    return { ok: false, errors };
  }

  const isMgdl = (ureaUnit.ok ? ureaUnit.value : 'mmol') === 'mgdl';
  const ureaMmol = isMgdl ? urea.value / 2.8 : urea.value;
  const female = (sex.ok ? sex.value : 'male') === 'female';

  const result = calculateGbs({
    ureaMmol,
    hemoglobinGDl: hemoglobin.value,
    female,
    systolicBp: systolicBp.value,
    pulse: pulse.value,
    melena: (melena.ok ? melena.value : '0') === '1',
    syncope: (syncope.ok ? syncope.value : '0') === '1',
    hepaticDisease: (hepaticDisease.ok ? hepaticDisease.value : '0') === '1',
    cardiacFailure: (cardiacFailure.ok ? cardiacFailure.value : '0') === '1',
  });

  const interpretationKey =
    result.total >= 6 ? 'gbsInterpretationHigh' : result.total >= 2 ? 'gbsInterpretationModerate' : 'gbsInterpretationLow';

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'gbsTotal', value: String(result.total), primary: true },
      { id: 'bun', labelKey: 'gbsBunShort', value: String(result.bunPoints) },
      { id: 'hemoglobin', labelKey: 'gbsHemoglobinShort', value: String(result.hemoglobinPoints) },
      { id: 'systolicBp', labelKey: 'gbsSbpShort', value: String(result.systolicBpPoints) },
      { id: 'pulse', labelKey: 'gbsPulseShort', value: String(result.pulsePoints) },
    ],
    working: `Urea ${result.bunPoints} + Hb ${result.hemoglobinPoints} + SBP ${result.systolicBpPoints} + Pulse ${result.pulsePoints} + Melena ${(melena.ok && melena.value) === '1' ? 1 : 0} + Syncope ${(syncope.ok && syncope.value) === '1' ? 1 : 0} + Liver ${(hepaticDisease.ok && hepaticDisease.value) === '1' ? 2 : 0} + Cardiac ${(cardiacFailure.ok && cardiacFailure.value) === '1' ? 2 : 0} = ${result.total}`,
    interpretationKey,
    data: { score: result.total },
  };
}

export const gbsCalculator: CalculatorDefinition = {
  id: 'glasgow-blatchford',
  slug: 'glasgow-blatchford',
  categoryKey: 'clinicalScores',
  titleKey: 'gbsTitle',
  descriptionKey: 'gbsDescription',
  fields,
  formula: 'GBS = urea + hemoglobin + systolic BP + pulse + melena + syncope + hepatic disease + cardiac failure',
  formulaDescriptionKey: 'gbsFormulaDescription',
  interpretationKey: 'gbsInterpretationLow',
  clinicalNoteKey: 'gbsClinicalNote',
  source: 'Glasgow-Blatchford score (Blatchford et al., Lancet 2000) for upper GI bleeding risk.',
  calculate,
};
