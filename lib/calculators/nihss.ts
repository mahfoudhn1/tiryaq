import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { validateNumberField } from './validation';

interface NihssItem {
  id: string;
  labelKey: TranslationKey;
  max: number;
}

const ITEMS: readonly NihssItem[] = [
  { id: 'loc', labelKey: 'nihssLoc', max: 3 },
  { id: 'locQuestions', labelKey: 'nihssLocQ', max: 2 },
  { id: 'locCommands', labelKey: 'nihssLocC', max: 2 },
  { id: 'gaze', labelKey: 'nihssGaze', max: 2 },
  { id: 'visualFields', labelKey: 'nihssVisual', max: 3 },
  { id: 'facialPalsy', labelKey: 'nihssFacial', max: 3 },
  { id: 'motorArmLeft', labelKey: 'nihssArmLeft', max: 4 },
  { id: 'motorArmRight', labelKey: 'nihssArmRight', max: 4 },
  { id: 'motorLegLeft', labelKey: 'nihssLegLeft', max: 4 },
  { id: 'motorLegRight', labelKey: 'nihssLegRight', max: 4 },
  { id: 'ataxia', labelKey: 'nihssAtaxia', max: 2 },
  { id: 'sensory', labelKey: 'nihssSensory', max: 2 },
  { id: 'language', labelKey: 'nihssLanguage', max: 3 },
  { id: 'dysarthria', labelKey: 'nihssDysarthria', max: 2 },
  { id: 'extinction', labelKey: 'nihssExtinction', max: 2 },
];

const fields: readonly CalculatorField[] = ITEMS.map((item) => ({
  id: item.id,
  labelKey: item.labelKey,
  min: 0,
  max: item.max,
  step: 1,
  inputMode: 'numeric',
}));

export interface NihssInput {
  [itemId: string]: number;
}

/**
 * Pure NIHSS total. Applies the coma rule: when item 1a (LOC) is 3, items 1b
 * and 1c are scored as 2. Untestable items are scored 0 per the official form.
 */
export function calculateNihss(input: NihssInput): number {
  const loc = input.loc;
  const locQuestions = loc === 3 ? 2 : input.locQuestions;
  const locCommands = loc === 3 ? 2 : input.locCommands;

  return ITEMS.reduce((sum, item) => {
    if (item.id === 'locQuestions') return sum + locQuestions;
    if (item.id === 'locCommands') return sum + locCommands;
    return sum + input[item.id];
  }, 0);
}

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const parsed: NihssInput = {};
  for (const item of ITEMS) {
    const result = validateNumberField(values[item.id], {
      required: true,
      min: 0,
      max: item.max,
      maxError: 'nihssItemRangeError',
    });
    if (!result.ok) {
      errors[item.id] = result.error;
    } else if (result.value !== null && !Number.isInteger(result.value)) {
      errors[item.id] = 'nihssItemRangeError';
    } else if (result.value !== null) {
      parsed[item.id] = result.value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const total = calculateNihss(parsed);
  const interpretationKey: TranslationKey =
    total >= 21
      ? 'nihssInterpretationSevere'
      : total >= 16
        ? 'nihssInterpretationModerateSevere'
        : total >= 5
          ? 'nihssInterpretationModerate'
          : total >= 1
            ? 'nihssInterpretationMinor'
            : 'nihssInterpretationNone';

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'nihssTotal', value: String(total), primary: true },
      ...ITEMS.map((item) => ({ id: item.id, labelKey: item.labelKey, value: String(parsed[item.id]) })),
    ],
    working: ITEMS.map((item) => `${parsed[item.id]}`).join(' + ') + ` = ${total}`,
    interpretationKey,
    data: { score: total },
  };
}

export const nihssCalculator: CalculatorDefinition = {
  id: 'nihss',
  slug: 'nihss',
  categoryKey: 'clinicalScores',
  titleKey: 'nihssTitle',
  descriptionKey: 'nihssDescription',
  fields,
  formula: 'NIHSS = sum of all 15 item scores (total 0–42)',
  formulaDescriptionKey: 'nihssFormulaDescription',
  interpretationKey: 'nihssInterpretationNone',
  clinicalNoteKey: 'nihssClinicalNote',
  source: 'National Institutes of Health Stroke Scale (NIHSS), 15 items scored per the official form.',
  calculate,
};
