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
  { id: 'age65', type: 'select', labelKey: 'timiAge65', options: YES_NO },
  { id: 'riskFactors', type: 'select', labelKey: 'timiRiskFactors', options: YES_NO },
  { id: 'knownCad', type: 'select', labelKey: 'timiKnownCad', options: YES_NO },
  { id: 'aspirin', type: 'select', labelKey: 'timiAspirin', options: YES_NO },
  { id: 'angina', type: 'select', labelKey: 'timiAngina', options: YES_NO },
  { id: 'stDeviation', type: 'select', labelKey: 'timiStDeviation', options: YES_NO },
  { id: 'biomarkers', type: 'select', labelKey: 'timiBiomarkers', options: YES_NO },
];

const WORKING_LABELS: Record<string, string> = {
  age65: 'Age≥65',
  riskFactors: 'Risk factors',
  knownCad: 'Known CAD',
  aspirin: 'Aspirin',
  angina: 'Angina',
  stDeviation: 'ST deviation',
  biomarkers: 'Biomarkers',
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
    total >= 5
      ? 'timiInterpretationVeryHigh'
      : total >= 3
        ? 'timiInterpretationHigh'
        : total === 2
          ? 'timiInterpretationModerate'
          : 'timiInterpretationLow';

  const working = fields
    .map((field) => `${WORKING_LABELS[field.id]} ${points[field.id]}`)
    .join(' + ');

  return {
    ok: true,
    metrics: [{ id: 'total', labelKey: 'timiScore', value: String(total), primary: true }],
    working: `${working} = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const timiCalculator: CalculatorDefinition = {
  id: 'timi',
  slug: 'timi',
  categoryKey: 'cardiology',
  alsoInCategories: ['clinicalScores'],
  titleKey: 'timiScore',
  descriptionKey: 'timiDescription',
  fields,
  formula: 'TIMI = age ≥65 + ≥3 risk factors + known CAD + aspirin + angina + ST deviation + biomarkers',
  formulaDescriptionKey: 'timiFormulaDescription',
  interpretationKey: 'timiInterpretationLow',
  clinicalNoteKey: 'timiClinicalNote',
  source: 'TIMI risk score for unstable angina / NSTEMI (Antman et al., 2000).',
  calculate,
};
