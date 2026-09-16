import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import { assignError, validateSelectField } from './validation';

const YES_NO: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'yes' },
  { value: '0', labelKey: 'no' },
];

const fields: readonly CalculatorField[] = [
  { id: 'respiratoryRate', type: 'select', labelKey: 'qsofaRr', options: YES_NO },
  { id: 'mentation', type: 'select', labelKey: 'qsofaMentation', options: YES_NO },
  { id: 'systolicBp', type: 'select', labelKey: 'qsofaSbp', options: YES_NO },
];

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};
  const points: Record<string, number> = {};

  for (const field of fields) {
    const allowed = (field.options ?? []).map((option) => option.value);
    const result = validateSelectField(values[field.id], allowed);
    assignError(errors, field.id, result);
    if (result.ok && result.value !== null) points[field.id] = Number(result.value);
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const total = Object.values(points).reduce((sum, value) => sum + value, 0);
  const interpretationKey = total >= 2 ? 'qsofaInterpretationHigh' : 'qsofaInterpretationLow';

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'qsofaTotal', value: String(total), primary: true },
      ...fields.map((field) => ({ id: field.id, labelKey: field.labelKey, value: String(points[field.id]) })),
    ],
    working: fields.map((field) => `${points[field.id]}`).join(' + ') + ` = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const qsofaCalculator: CalculatorDefinition = {
  id: 'qsofa',
  slug: 'qsofa',
  categoryKey: 'clinicalScores',
  titleKey: 'qsofaTitle',
  descriptionKey: 'qsofaDescription',
  fields,
  formula: 'qSOFA = RR ≥22 + altered mentation + SBP ≤100 (1 point each)',
  formulaDescriptionKey: 'qsofaFormulaDescription',
  interpretationKey: 'qsofaInterpretationLow',
  clinicalNoteKey: 'qsofaClinicalNote',
  source: 'qSOFA (Singer et al., JAMA 2016) for suspected infection outside the ICU.',
  calculate,
};
