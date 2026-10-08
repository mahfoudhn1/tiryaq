import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateSelectField } from './validation';

function yesNo(points: string): readonly CalculatorOption[] {
  return [
    { value: points, labelKey: 'yes' },
    { value: '0', labelKey: 'no' },
  ];
}

const fields: readonly CalculatorField[] = [
  { id: 'dvtSigns', type: 'select', labelKey: 'wellsDvtSigns', options: yesNo('3') },
  { id: 'peMostLikely', type: 'select', labelKey: 'wellsPeMostLikely', options: yesNo('3') },
  { id: 'heartRate', type: 'select', labelKey: 'wellsHr100', options: yesNo('1.5') },
  { id: 'immobilization', type: 'select', labelKey: 'wellsImmobilization', options: yesNo('1.5') },
  { id: 'previousDvtPe', type: 'select', labelKey: 'wellsPreviousDvtPe', options: yesNo('1.5') },
  { id: 'hemoptysis', type: 'select', labelKey: 'wellsHemoptysis', options: yesNo('1') },
  { id: 'malignancy', type: 'select', labelKey: 'wellsMalignancy', options: yesNo('1') },
];

const WORKING_LABELS: Record<string, string> = {
  dvtSigns: 'DVT signs',
  peMostLikely: 'PE most likely',
  heartRate: 'HR >100',
  immobilization: 'Immobilization/surgery',
  previousDvtPe: 'Previous DVT/PE',
  hemoptysis: 'Hemoptysis',
  malignancy: 'Malignancy',
};

function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

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

  const total = fields.reduce((sum, field) => sum + points[field.id], 0);
  const interpretationKey: TranslationKey =
    total > 4 ? 'wellsInterpretationLikely' : 'wellsInterpretationUnlikely';

  const working = fields
    .map((field) => `${WORKING_LABELS[field.id]} ${formatScore(points[field.id])}`)
    .join(' + ');

  return {
    ok: true,
    metrics: [{ id: 'total', labelKey: 'wellsScore', value: formatScore(total), primary: true }],
    working: `${working} = ${formatScore(total)}`,
    interpretationKey,
    data: { score: total },
  };
}

export const wellsPeCalculator: CalculatorDefinition = {
  id: 'wells-pe',
  slug: 'wells-pe',
  categoryKey: 'emergencyAndTrauma',
  alsoInCategories: ['clinicalScores'],
  titleKey: 'wellsScore',
  descriptionKey: 'wellsDescription',
  fields,
  formula: 'Wells PE = DVT signs + PE most likely + HR + immobilization + previous DVT/PE + hemoptysis + malignancy',
  formulaDescriptionKey: 'wellsFormulaDescription',
  interpretationKey: 'wellsInterpretationUnlikely',
  clinicalNoteKey: 'wellsClinicalNote',
  source: 'Wells score for pulmonary embolism (Wells et al., 2000).',
  calculate,
};
