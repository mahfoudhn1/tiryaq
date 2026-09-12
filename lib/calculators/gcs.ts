import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import type { Language } from '@/store/slices/localeSlice';
import type { TranslationKey } from '@/lib/i18n/translations';
import { translate } from '@/lib/i18n/translations';

const REQUIRED_FIELD_ERROR = 'valueRequiredError';
const INVALID_OPTION_ERROR = 'invalidSelectionError';
const GCS_MIN = 3;
const GCS_MAX = 15;

/**
 * Select options carry an English label in `labelKey` that the English
 * dictionary already contains. French and Arabic component descriptions differ
 * per component (the same score means different things for eye, verbal, and
 * motor), so those are resolved from a small component-aware map rather than
 * overloading the flat dictionary with 15 additional keys.
 */
const COMPONENT_LABELS: Record<'eye' | 'verbal' | 'motor', Partial<Record<Language, Record<string, string>>>> = {
  eye: {
    fr: { '4': 'Spontanée', '3': 'Au bruit', '2': 'À la douleur', '1': 'Aucune' },
    ar: { '4': 'تلقائي', '3': 'عند النداء', '2': 'عند الألم', '1': 'لا يوجد' },
  },
  verbal: {
    fr: { '5': 'Orientée', '4': 'Confuse', '3': 'Mots inappropriés', '2': 'Sons incompréhensibles', '1': 'Aucune' },
    ar: { '5': 'واعٍ ومتوجّه', '4': 'مرتبك', '3': 'كلمات غير مناسبة', '2': 'أصوات غير مفهومة', '1': 'لا يوجد' },
  },
  motor: {
    fr: { '6': 'Obéit aux ordres', '5': 'Localise la douleur', '4': 'Retrait à la douleur', '3': 'Flexion anormale', '2': 'Extension anormale', '1': 'Aucune' },
    ar: { '6': 'يستجيب للأوامر', '5': 'يحدّد موضع الألم', '4': 'يتجنّب الألم', '3': 'انثناء غير طبيعي', '2': 'بسط غير طبيعي', '1': 'لا يوجد' },
  },
};

function makeComponentOptions(
  entries: readonly [string, TranslationKey][]
): readonly CalculatorOption[] {
  return entries.map(([value, labelKey]) => ({ value, labelKey }));
}

function resolveComponentLabel(component: 'eye' | 'verbal' | 'motor') {
  return (language: Language, option: CalculatorOption): string => {
    const localized = COMPONENT_LABELS[component][language]?.[option.value];
    return localized ?? translate(language, option.labelKey);
  };
}

const eyeField: CalculatorField = {
  id: 'eye',
  type: 'select',
  labelKey: 'gcsEyeOpening',
  options: makeComponentOptions([
    ['4', 'gcsEyeSpontaneous'],
    ['3', 'gcsEyeToVoice'],
    ['2', 'gcsEyeToPain'],
    ['1', 'gcsEyeNone'],
  ]),
  optionLabel: resolveComponentLabel('eye'),
};

const verbalField: CalculatorField = {
  id: 'verbal',
  type: 'select',
  labelKey: 'gcsVerbalResponse',
  options: makeComponentOptions([
    ['5', 'gcsVerbalOriented'],
    ['4', 'gcsVerbalConfused'],
    ['3', 'gcsVerbalInappropriate'],
    ['2', 'gcsVerbalSounds'],
    ['1', 'gcsVerbalNone'],
  ]),
  optionLabel: resolveComponentLabel('verbal'),
};

const motorField: CalculatorField = {
  id: 'motor',
  type: 'select',
  labelKey: 'gcsMotorResponse',
  options: makeComponentOptions([
    ['6', 'gcsMotorObeys'],
    ['5', 'gcsMotorLocalizes'],
    ['4', 'gcsMotorWithdraws'],
    ['3', 'gcsMotorFlexion'],
    ['2', 'gcsMotorExtension'],
    ['1', 'gcsMotorNone'],
  ]),
  optionLabel: resolveComponentLabel('motor'),
};

function isAllowed(field: CalculatorField, value: string): boolean {
  return field.options?.some((option) => option.value === value) ?? false;
}

function calculateGcs(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  for (const field of [eyeField, verbalField, motorField]) {
    const value = values[field.id];
    if (value === undefined || value.trim() === '') {
      errors[field.id] = REQUIRED_FIELD_ERROR;
    } else if (!isAllowed(field, value)) {
      errors[field.id] = INVALID_OPTION_ERROR;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const eye = Number(values.eye);
  const verbal = Number(values.verbal);
  const motor = Number(values.motor);
  const total = eye + verbal + motor;

  const interpretationKey =
    total >= 13 ? 'gcsInterpretationMild' : total >= 9 ? 'gcsInterpretationModerate' : 'gcsInterpretationSevere';

  return {
    ok: true,
    metrics: [
      {
        id: 'gcs',
        labelKey: 'gcsTotalScore',
        value: `${total} / ${GCS_MAX}`,
        primary: true,
      },
      { id: 'eye', labelKey: 'gcsEyeShort', value: String(eye) },
      { id: 'verbal', labelKey: 'gcsVerbalShort', value: String(verbal) },
      { id: 'motor', labelKey: 'gcsMotorShort', value: String(motor) },
    ],
    working: `E${eye} + V${verbal} + M${motor} = ${total} (range ${GCS_MIN}–${GCS_MAX})`,
    interpretationKey,
    warnings: ['gcsAssessmentWarning'],
  };
}

export const gcsCalculator: CalculatorDefinition = {
  id: 'gcs',
  slug: 'gcs',
  categoryKey: 'emergencyAndTrauma',
  titleKey: 'glasgowComaScale',
  descriptionKey: 'gcsDescription',
  fields: [eyeField, verbalField, motorField],
  formula: 'GCS = E + V + M',
  formulaDescriptionKey: 'gcsFormulaDescription',
  interpretationKey: 'gcsInterpretationMild',
  clinicalNoteKey: 'gcsClinicalNote',
  source: 'Glasgow Coma Scale (Teasdale & Jennett). Sum of Eye (1–4), Verbal (1–5) and Motor (1–6) responses.',
  calculate: calculateGcs,
};
