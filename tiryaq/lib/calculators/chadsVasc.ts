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

/** Age is a single field so the 65–74 and ≥75 points can never double-count. */
const AGE_OPTIONS: readonly CalculatorOption[] = [
  { value: '0', labelKey: 'chaAgeUnder65' },
  { value: '1', labelKey: 'chaAge65to74' },
  { value: '2', labelKey: 'chaAge75plus' },
];

const fields: readonly CalculatorField[] = [
  { id: 'chf', type: 'select', labelKey: 'chaChf', options: YES_NO },
  { id: 'hypertension', type: 'select', labelKey: 'chaHypertension', options: YES_NO },
  { id: 'age', type: 'select', labelKey: 'chaAge', options: AGE_OPTIONS },
  { id: 'diabetes', type: 'select', labelKey: 'chaDiabetes', options: YES_NO },
  { id: 'stroke', type: 'select', labelKey: 'chaStroke', options: [
    { value: '2', labelKey: 'yes' },
    { value: '0', labelKey: 'no' },
  ] },
  { id: 'vascular', type: 'select', labelKey: 'chaVascular', options: YES_NO },
  {
    id: 'sex',
    type: 'select',
    labelKey: 'chaSex',
    options: [
      { value: '0', labelKey: 'sexMale' },
      { value: '1', labelKey: 'sexFemale' },
    ],
  },
];

const COMPONENT_LABELS: Record<string, TranslationKey> = {
  chf: 'chaChfShort',
  hypertension: 'chaHypertensionShort',
  age: 'chaAgeShort',
  diabetes: 'chaDiabetesShort',
  stroke: 'chaStrokeShort',
  vascular: 'chaVascularShort',
  sex: 'chaSexShort',
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
    total === 0 ? 'chaInterpretationLow' : total === 1 ? 'chaInterpretationModerate' : 'chaInterpretationHigh';

  const working = [
    `C ${points.chf}`,
    `H ${points.hypertension}`,
    `Age ${points.age}`,
    `D ${points.diabetes}`,
    `S₂ ${points.stroke}`,
    `V ${points.vascular}`,
    `Sc ${points.sex}`,
  ].join(' + ');

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'chaScore', value: String(total), primary: true },
      ...fields.map((field) => ({
        id: field.id,
        labelKey: COMPONENT_LABELS[field.id],
        value: String(points[field.id]),
      })),
    ],
    working: `${working} = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const chadsVascCalculator: CalculatorDefinition = {
  id: 'chads-vasc',
  slug: 'chads-vasc',
  categoryKey: 'cardiology',
  alsoInCategories: ['clinicalScores'],
  titleKey: 'chaScore',
  descriptionKey: 'chaDescription',
  fields,
  formula: 'CHA₂DS₂-VASc = C + H + A₂ + D + S₂ + V + A + Sc',
  formulaDescriptionKey: 'chaFormulaDescription',
  interpretationKey: 'chaInterpretationLow',
  clinicalNoteKey: 'chaClinicalNote',
  source: 'CHA₂DS₂-VASc score (Lip et al., 2010). Stroke risk stratification in non-valvular atrial fibrillation.',
  calculate,
};
