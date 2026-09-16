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

/** BUN mg/dL equivalent of the 7 mmol/L urea threshold (7 × 2.8). */
export const CURB65_UREA_MMOL_THRESHOLD = 7;
export const CURB65_BUN_MGDL_THRESHOLD = CURB65_UREA_MMOL_THRESHOLD * 2.8;

const fields: readonly CalculatorField[] = [
  { id: 'confusion', type: 'select', labelKey: 'curb65Confusion', options: YES_NO },
  { id: 'urea', labelKey: 'curb65Urea', placeholder: '5', min: 0, step: 0.1, inputMode: 'decimal' },
  {
    id: 'ureaUnit',
    type: 'select',
    labelKey: 'curb65UreaUnit',
    defaultValue: 'mmol',
    showOptionValue: false,
    options: [
      { value: 'mmol', labelKey: 'unitMmolLUrea' },
      { value: 'mgdl', labelKey: 'unitMgDlBun' },
    ],
  },
  { id: 'respiratoryRate', labelKey: 'curb65RespiratoryRate', unit: '/min', placeholder: '18', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'systolicBp', labelKey: 'curb65Sbp', unit: 'mmHg', placeholder: '120', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'diastolicBp', labelKey: 'curb65Dbp', unit: 'mmHg', placeholder: '75', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'age', labelKey: 'labelAge', unit: 'years', placeholder: '60', min: 0, max: 120, step: 1, inputMode: 'numeric' },
];

export interface Curb65Input {
  confusion: boolean;
  /** Urea in mmol/L. */
  ureaMmol: number;
  respiratoryRate: number;
  systolicBp: number;
  diastolicBp: number;
  age: number;
}

/** Pure CURB-65 score (0–5). */
export function calculateCurb65(input: Curb65Input): number {
  let score = 0;
  if (input.confusion) score += 1;
  if (input.ureaMmol > CURB65_UREA_MMOL_THRESHOLD) score += 1;
  if (input.respiratoryRate >= 30) score += 1;
  if (input.systolicBp < 90 || input.diastolicBp <= 60) score += 1;
  if (input.age >= 65) score += 1;
  return score;
}

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const confusion = validateSelectField(values.confusion, ['1', '0']);
  const urea = validateNumberField(values.urea, { required: true, min: 0, exclusiveMin: true });
  const ureaUnit = validateSelectField(values.ureaUnit, ['mmol', 'mgdl']);
  const respiratoryRate = validateNumberField(values.respiratoryRate, { required: true, min: 0 });
  const systolicBp = validateNumberField(values.systolicBp, { required: true, min: 0, exclusiveMin: true });
  const diastolicBp = validateNumberField(values.diastolicBp, { required: true, min: 0, exclusiveMin: true });
  const age = validateNumberField(values.age, { required: true, min: 0, max: 120 });

  assignError(errors, 'confusion', confusion);
  assignError(errors, 'urea', urea);
  assignError(errors, 'ureaUnit', ureaUnit);
  assignError(errors, 'respiratoryRate', respiratoryRate);
  assignError(errors, 'systolicBp', systolicBp);
  assignError(errors, 'diastolicBp', diastolicBp);
  assignError(errors, 'age', age);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !urea.ok || urea.value === null ||
    !respiratoryRate.ok || respiratoryRate.value === null ||
    !systolicBp.ok || systolicBp.value === null ||
    !diastolicBp.ok || diastolicBp.value === null ||
    !age.ok || age.value === null
  ) {
    return { ok: false, errors };
  }

  const isMgdl = (ureaUnit.ok ? ureaUnit.value : 'mmol') === 'mgdl';
  const ureaMmol = isMgdl ? urea.value / 2.8 : urea.value;
  const confusionYes = (confusion.ok ? confusion.value : '0') === '1';

  const total = calculateCurb65({
    confusion: confusionYes,
    ureaMmol,
    respiratoryRate: respiratoryRate.value,
    systolicBp: systolicBp.value,
    diastolicBp: diastolicBp.value,
    age: age.value,
  });

  const interpretationKey = total >= 3 ? 'curb65InterpretationHigh' : total === 2 ? 'curb65InterpretationModerate' : 'curb65InterpretationLow';

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'curb65Total', value: String(total), primary: true },
      { id: 'confusion', labelKey: 'curb65Confusion', value: confusionYes ? '1' : '0' },
      { id: 'urea', labelKey: 'curb65Urea', value: ureaMmol > CURB65_UREA_MMOL_THRESHOLD ? '1' : '0' },
      { id: 'respiratoryRate', labelKey: 'curb65RespiratoryRate', value: respiratoryRate.value >= 30 ? '1' : '0' },
      { id: 'bloodPressure', labelKey: 'curb65BloodPressure', value: systolicBp.value < 90 || diastolicBp.value <= 60 ? '1' : '0' },
      { id: 'age', labelKey: 'labelAge', value: age.value >= 65 ? '1' : '0' },
    ],
    working: `C ${confusionYes ? 1 : 0} + U ${ureaMmol > CURB65_UREA_MMOL_THRESHOLD ? 1 : 0} + R ${respiratoryRate.value >= 30 ? 1 : 0} + B ${systolicBp.value < 90 || diastolicBp.value <= 60 ? 1 : 0} + 65 ${age.value >= 65 ? 1 : 0} = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const curb65Calculator: CalculatorDefinition = {
  id: 'curb-65',
  slug: 'curb-65',
  categoryKey: 'clinicalScores',
  titleKey: 'curb65Title',
  descriptionKey: 'curb65Description',
  fields,
  formula: 'CURB-65 = confusion + urea >7 mmol/L + RR ≥30 + SBP <90 or DBP ≤60 + age ≥65',
  formulaDescriptionKey: 'curb65FormulaDescription',
  interpretationKey: 'curb65InterpretationLow',
  clinicalNoteKey: 'curb65ClinicalNote',
  source: 'CURB-65 (Lim et al., Thorax 2003) for community-acquired pneumonia severity.',
  calculate,
};
