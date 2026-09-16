import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateSelectField } from './validation';

const YES_NO: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'yes' },
  { value: '0', labelKey: 'no' },
];

/**
 * The nine HAS-BLED components. Renal and liver function, and drugs and
 * alcohol, are kept as separate items per the standard definition.
 */
const fields: readonly CalculatorField[] = [
  { id: 'hypertension', type: 'select', labelKey: 'hbHypertension', options: YES_NO },
  { id: 'renal', type: 'select', labelKey: 'hbRenal', options: YES_NO },
  { id: 'liver', type: 'select', labelKey: 'hbLiver', options: YES_NO },
  { id: 'stroke', type: 'select', labelKey: 'hbStroke', options: YES_NO },
  { id: 'bleeding', type: 'select', labelKey: 'hbBleeding', options: YES_NO },
  { id: 'labileInr', type: 'select', labelKey: 'hbLabileInr', options: YES_NO },
  { id: 'elderly', type: 'select', labelKey: 'hbElderly', options: YES_NO },
  { id: 'drugs', type: 'select', labelKey: 'hbDrugs', options: YES_NO },
  { id: 'alcohol', type: 'select', labelKey: 'hbAlcohol', options: YES_NO },
];

const WORKING_LABELS: Record<string, string> = {
  hypertension: 'H',
  renal: 'R',
  liver: 'L',
  stroke: 'S',
  bleeding: 'B',
  labileInr: 'INR',
  elderly: 'E',
  drugs: 'D',
  alcohol: 'A',
};

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};
  const points: Record<string, number> = {};

  for (const field of fields) {
    const allowed = (field.options ?? []).map((option) => option.value);
    const result = validateSelectField(values[field.id], allowed);
    assignError(errors, field.id, result);
    if (result.ok && result.value !== null) {
      points[field.id] = Number(result.value);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const total = Object.values(points).reduce((sum, value) => sum + value, 0);
  const interpretationKey: TranslationKey =
    total >= 3 ? 'hasBledInterpretationHigh' : 'hasBledInterpretationLow';

  const working = fields
    .map((field) => `${WORKING_LABELS[field.id]} ${points[field.id]}`)
    .join(' + ');

  return {
    ok: true,
    metrics: [{ id: 'total', labelKey: 'hasBledScore', value: String(total), primary: true }],
    working: `${working} = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const hasBledCalculator: CalculatorDefinition = {
  id: 'has-bled',
  slug: 'has-bled',
  categoryKey: 'cardiology',
  alsoInCategories: ['clinicalScores'],
  titleKey: 'hasBledScore',
  descriptionKey: 'hasBledDescription',
  fields,
  formula: 'HAS-BLED = H + A + S + B + L + E + D',
  formulaDescriptionKey: 'hasBledFormulaDescription',
  interpretationKey: 'hasBledInterpretationLow',
  clinicalNoteKey: 'hasBledClinicalNote',
  source: 'HAS-BLED bleeding risk score (Pisters et al., 2010) for patients on anticoagulation.',
  calculate,
};
