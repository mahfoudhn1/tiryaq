import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField, validateSelectField } from './validation';

/** µmol/L per mg/dL for bilirubin. */
const BILIRUBIN_UMOL_PER_MGDL = 17.1;

const ASCITES_OPTIONS: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'childPughAscitesNone' },
  { value: '2', labelKey: 'childPughAscitesSlight' },
  { value: '3', labelKey: 'childPughAscitesModerate' },
];

const ENCEPHALOPATHY_OPTIONS: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'childPughEnceNone' },
  { value: '2', labelKey: 'childPughEnceGrade12' },
  { value: '3', labelKey: 'childPughEnceGrade34' },
];

const fields: readonly CalculatorField[] = [
  { id: 'bilirubin', labelKey: 'childPughBilirubin', placeholder: '1.5', min: 0, step: 0.1, inputMode: 'decimal' },
  {
    id: 'bilirubinUnit',
    type: 'select',
    labelKey: 'childPughBilirubinUnit',
    defaultValue: 'mgdl',
    showOptionValue: false,
    options: [
      { value: 'mgdl', labelKey: 'unitMgDl' },
      { value: 'umol', labelKey: 'unitUmolL' },
    ],
  },
  { id: 'albumin', labelKey: 'childPughAlbumin', unit: 'g/dL', placeholder: '3.5', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'inr', labelKey: 'childPughInr', placeholder: '1.2', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'ascites', type: 'select', labelKey: 'childPughAscites', options: ASCITES_OPTIONS },
  { id: 'encephalopathy', type: 'select', labelKey: 'childPughEncephalopathy', options: ENCEPHALOPATHY_OPTIONS },
];

export interface ChildPughInput {
  /** Bilirubin in mg/dL. */
  bilirubinMgDl: number;
  albuminGDl: number;
  inr: number;
  ascites: number;
  encephalopathy: number;
}

export interface ChildPughResult {
  total: number;
  bilirubinPoints: number;
  albuminPoints: number;
  inrPoints: number;
  classKey: TranslationKey;
}

/** Pure Child-Pugh score and class. */
export function calculateChildPugh(input: ChildPughInput): ChildPughResult {
  const bilirubinPoints = input.bilirubinMgDl < 2 ? 1 : input.bilirubinMgDl <= 3 ? 2 : 3;
  const albuminPoints = input.albuminGDl > 3.5 ? 1 : input.albuminGDl >= 2.8 ? 2 : 3;
  const inrPoints = input.inr < 1.7 ? 1 : input.inr <= 2.3 ? 2 : 3;
  const total = bilirubinPoints + albuminPoints + inrPoints + input.ascites + input.encephalopathy;

  const classKey: TranslationKey = total <= 6 ? 'childPughClassA' : total <= 9 ? 'childPughClassB' : 'childPughClassC';
  return { total, bilirubinPoints, albuminPoints, inrPoints, classKey };
}

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const bilirubin = validateNumberField(values.bilirubin, { required: true, min: 0, exclusiveMin: true });
  const bilirubinUnit = validateSelectField(values.bilirubinUnit, ['mgdl', 'umol']);
  const albumin = validateNumberField(values.albumin, { required: true, min: 0, exclusiveMin: true });
  const inr = validateNumberField(values.inr, { required: true, min: 0, exclusiveMin: true });
  const ascites = validateSelectField(values.ascites, ['1', '2', '3']);
  const encephalopathy = validateSelectField(values.encephalopathy, ['1', '2', '3']);

  assignError(errors, 'bilirubin', bilirubin);
  assignError(errors, 'bilirubinUnit', bilirubinUnit);
  assignError(errors, 'albumin', albumin);
  assignError(errors, 'inr', inr);
  assignError(errors, 'ascites', ascites);
  assignError(errors, 'encephalopathy', encephalopathy);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !bilirubin.ok || bilirubin.value === null ||
    !albumin.ok || albumin.value === null ||
    !inr.ok || inr.value === null
  ) {
    return { ok: false, errors };
  }

  const isUmol = (bilirubinUnit.ok ? bilirubinUnit.value : 'mgdl') === 'umol';
  const bilirubinMgDl = isUmol ? bilirubin.value / BILIRUBIN_UMOL_PER_MGDL : bilirubin.value;

  const result = calculateChildPugh({
    bilirubinMgDl,
    albuminGDl: albumin.value,
    inr: inr.value,
    ascites: Number(ascites.ok ? ascites.value : '1'),
    encephalopathy: Number(encephalopathy.ok ? encephalopathy.value : '1'),
  });

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'childPughTotal', value: String(result.total), primary: true },
      { id: 'class', labelKey: 'labelChildPughClass', value: '', valueKey: result.classKey },
      { id: 'bilirubin', labelKey: 'childPughBilirubin', value: String(result.bilirubinPoints) },
      { id: 'albumin', labelKey: 'childPughAlbumin', value: String(result.albuminPoints) },
      { id: 'inr', labelKey: 'childPughInr', value: String(result.inrPoints) },
      { id: 'ascites', labelKey: 'childPughAscites', value: String(ascites.ok ? ascites.value : '') },
      { id: 'encephalopathy', labelKey: 'childPughEncephalopathy', value: String(encephalopathy.ok ? encephalopathy.value : '') },
    ],
    working: `Bili ${result.bilirubinPoints} + Albumin ${result.albuminPoints} + INR ${result.inrPoints} + Ascites ${ascites.ok ? ascites.value : ''} + Encephalopathy ${encephalopathy.ok ? encephalopathy.value : ''} = ${result.total}`,
    interpretationKey: result.classKey,
    data: { score: result.total },
  };
}

export const childPughCalculator: CalculatorDefinition = {
  id: 'child-pugh',
  slug: 'child-pugh',
  categoryKey: 'clinicalScores',
  titleKey: 'childPughTitle',
  descriptionKey: 'childPughDescription',
  fields,
  formula: 'Child-Pugh = bilirubin + albumin + INR + ascites + encephalopathy (1–3 each)',
  formulaDescriptionKey: 'childPughFormulaDescription',
  interpretationKey: 'childPughClassA',
  clinicalNoteKey: 'childPughClinicalNote',
  source: 'Child-Pugh classification for chronic liver disease severity.',
  calculate,
};
