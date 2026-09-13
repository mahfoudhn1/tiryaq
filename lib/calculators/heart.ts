import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateSelectField } from './validation';

const HISTORY: readonly CalculatorOption[] = [
  { value: '0', labelKey: 'heartHistory0' },
  { value: '1', labelKey: 'heartHistory1' },
  { value: '2', labelKey: 'heartHistory2' },
];

const ECG: readonly CalculatorOption[] = [
  { value: '0', labelKey: 'heartEcg0' },
  { value: '1', labelKey: 'heartEcg1' },
  { value: '2', labelKey: 'heartEcg2' },
];

const AGE: readonly CalculatorOption[] = [
  { value: '0', labelKey: 'heartAge0' },
  { value: '1', labelKey: 'heartAge1' },
  { value: '2', labelKey: 'heartAge2' },
];

const RISK_FACTORS: readonly CalculatorOption[] = [
  { value: '0', labelKey: 'heartRisk0' },
  { value: '1', labelKey: 'heartRisk1' },
  { value: '2', labelKey: 'heartRisk2' },
];

const TROPONIN: readonly CalculatorOption[] = [
  { value: '0', labelKey: 'heartTroponin0' },
  { value: '1', labelKey: 'heartTroponin1' },
  { value: '2', labelKey: 'heartTroponin2' },
];

const fields: readonly CalculatorField[] = [
  { id: 'history', type: 'select', labelKey: 'heartHistory', options: HISTORY },
  { id: 'ecg', type: 'select', labelKey: 'heartEcg', options: ECG },
  { id: 'age', type: 'select', labelKey: 'heartAge', options: AGE },
  { id: 'riskFactors', type: 'select', labelKey: 'heartRiskFactors', options: RISK_FACTORS },
  { id: 'troponin', type: 'select', labelKey: 'heartTroponin', options: TROPONIN },
];

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
    total >= 7 ? 'heartInterpretationHigh' : total >= 4 ? 'heartInterpretationModerate' : 'heartInterpretationLow';

  const working = [
    `History ${points.history}`,
    `ECG ${points.ecg}`,
    `Age ${points.age}`,
    `Risk factors ${points.riskFactors}`,
    `Troponin ${points.troponin}`,
  ].join(' + ');

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'heartScore', value: String(total), primary: true },
      ...fields.map((field) => ({
        id: field.id,
        labelKey: field.labelKey,
        value: String(points[field.id]),
      })),
    ],
    working: `${working} = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const heartScoreCalculator: CalculatorDefinition = {
  id: 'heart-score',
  slug: 'heart-score',
  categoryKey: 'cardiology',
  titleKey: 'heartScore',
  descriptionKey: 'heartDescription',
  fields,
  formula: 'HEART = History + ECG + Age + Risk factors + Troponin',
  formulaDescriptionKey: 'heartFormulaDescription',
  interpretationKey: 'heartInterpretationLow',
  clinicalNoteKey: 'heartClinicalNote',
  source: 'HEART score (Six et al., 2008) for early risk stratification of chest pain in the emergency department.',
  calculate,
};
