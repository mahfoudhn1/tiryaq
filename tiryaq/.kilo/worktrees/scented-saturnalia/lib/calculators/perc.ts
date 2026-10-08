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

const fields: readonly CalculatorField[] = [
  { id: 'age50', type: 'select', labelKey: 'percAge50', options: YES_NO },
  { id: 'heartRate', type: 'select', labelKey: 'percHr100', options: YES_NO },
  { id: 'oxygen', type: 'select', labelKey: 'percO2', options: YES_NO },
  { id: 'legSwelling', type: 'select', labelKey: 'percLegSwelling', options: YES_NO },
  { id: 'hemoptysis', type: 'select', labelKey: 'percHemoptysis', options: YES_NO },
  { id: 'surgery', type: 'select', labelKey: 'percSurgery', options: YES_NO },
  { id: 'priorPeDvt', type: 'select', labelKey: 'percPriorPeDvt', options: YES_NO },
  { id: 'estrogen', type: 'select', labelKey: 'percEstrogen', options: YES_NO },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};
  const positives: Record<string, number> = {};

  for (const field of fields) {
    const allowed = (field.options ?? []).map((option) => option.value);
    const result = validateSelectField(values[field.id], allowed);
    assignError(errors, field.id, result);
    if (result.ok && result.value !== null) {
      positives[field.id] = Number(result.value);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const positiveCount = Object.values(positives).reduce((sum, value) => sum + value, 0);
  const allNegative = positiveCount === 0;
  const interpretationKey: TranslationKey = allNegative
    ? 'percInterpretationNegative'
    : 'percInterpretationPositive';

  return {
    ok: true,
    metrics: [
      { id: 'positiveCount', labelKey: 'percPositiveCount', value: String(positiveCount), primary: true },
      {
        id: 'result',
        labelKey: 'percResult',
        value: '',
        valueKey: allNegative ? 'percNegative' : 'percPositive',
      },
    ],
    working: `${positiveCount} of ${fields.length} criteria positive = ${
      allNegative ? 'PERC negative' : 'PERC positive'
    }`,
    interpretationKey,
    data: { positiveCount },
  };
}

export const percCalculator: CalculatorDefinition = {
  id: 'perc',
  slug: 'perc',
  categoryKey: 'emergencyAndTrauma',
  alsoInCategories: ['clinicalScores'],
  titleKey: 'percScore',
  descriptionKey: 'percDescription',
  fields,
  formula: 'PERC = count of positive criteria (0 of 8 = criteria satisfied)',
  formulaDescriptionKey: 'percFormulaDescription',
  interpretationKey: 'percInterpretationNegative',
  clinicalNoteKey: 'percClinicalNote',
  source: 'PERC rule (Kline et al., 2004) for pulmonary embolism in low-risk patients.',
  calculate,
};
