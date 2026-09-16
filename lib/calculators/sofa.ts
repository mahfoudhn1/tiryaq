import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorOption,
} from './types';
import { assignError, validateNumberField, validateSelectField } from './validation';

const YES_NO: readonly CalculatorOption[] = [
  { value: '1', labelKey: 'yes' },
  { value: '0', labelKey: 'no' },
];

export interface SofaInput {
  pao2MmHg: number;
  fio2Percent: number;
  respiratorySupport: boolean;
  platelets: number;
  bilirubinMgDl: number;
  mapMmHg: number;
  dopamine: number;
  dobutamine: number;
  epinephrine: number;
  norepinephrine: number;
  gcs: number;
  creatinineMgDl: number;
  /** 24-hour urine output in mL, when available. */
  urineOutputMl?: number;
}

export interface SofaResult {
  total: number;
  respiratory: number;
  coagulation: number;
  liver: number;
  cardiovascular: number;
  cns: number;
  renal: number;
}

function respiratoryScore(input: SofaInput): number {
  const ratio = input.pao2MmHg / (input.fio2Percent / 100);
  if (ratio >= 400) return 0;
  if (ratio >= 300) return 1;
  if (ratio >= 200) return 2;
  if (!input.respiratorySupport) return 2;
  return ratio >= 100 ? 3 : 4;
}

function coagulationScore(platelets: number): number {
  if (platelets >= 150) return 0;
  if (platelets >= 100) return 1;
  if (platelets >= 50) return 2;
  if (platelets >= 20) return 3;
  return 4;
}

function liverScore(bilirubinMgDl: number): number {
  if (bilirubinMgDl < 1.2) return 0;
  if (bilirubinMgDl < 2) return 1;
  if (bilirubinMgDl < 6) return 2;
  if (bilirubinMgDl < 12) return 3;
  return 4;
}

function cardiovascularScore(input: SofaInput): number {
  if (input.dopamine > 15 || input.epinephrine > 0.1 || input.norepinephrine > 0.1) return 4;
  if (
    input.dopamine > 5 ||
    (input.epinephrine > 0 && input.epinephrine <= 0.1) ||
    (input.norepinephrine > 0 && input.norepinephrine <= 0.1)
  ) {
    return 3;
  }
  if ((input.dopamine > 0 && input.dopamine <= 5) || input.dobutamine > 0) return 2;
  if (input.mapMmHg < 70) return 1;
  return 0;
}

function cnsScore(gcs: number): number {
  if (gcs >= 15) return 0;
  if (gcs >= 13) return 1;
  if (gcs >= 10) return 2;
  if (gcs >= 6) return 3;
  return 4;
}

function renalScore(creatinineMgDl: number, urineOutputMl?: number): number {
  let score = 0;
  if (creatinineMgDl >= 5) score = 4;
  else if (creatinineMgDl >= 3.5) score = 3;
  else if (creatinineMgDl >= 2) score = 2;
  else if (creatinineMgDl >= 1.2) score = 1;

  if (urineOutputMl !== undefined) {
    if (urineOutputMl < 200) score = Math.max(score, 4);
    else if (urineOutputMl < 500) score = Math.max(score, 3);
  }
  return score;
}

/** Pure SOFA score (0–24). */
export function calculateSofa(input: SofaInput): SofaResult {
  const respiratory = respiratoryScore(input);
  const coagulation = coagulationScore(input.platelets);
  const liver = liverScore(input.bilirubinMgDl);
  const cardiovascular = cardiovascularScore(input);
  const cns = cnsScore(input.gcs);
  const renal = renalScore(input.creatinineMgDl, input.urineOutputMl);
  const total = respiratory + coagulation + liver + cardiovascular + cns + renal;
  return { total, respiratory, coagulation, liver, cardiovascular, cns, renal };
}

const fields: readonly CalculatorField[] = [
  { id: 'pao2', labelKey: 'sofaPao2', unit: 'mmHg', placeholder: '95', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'fio2', labelKey: 'sofaFio2', unit: '%', placeholder: '21', min: 21, max: 100, step: 1, inputMode: 'numeric' },
  { id: 'respiratorySupport', type: 'select', labelKey: 'sofaRespiratorySupport', options: YES_NO },
  { id: 'platelets', labelKey: 'sofaPlatelets', unit: '×10³/µL', placeholder: '200', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'bilirubin', labelKey: 'childPughBilirubin', unit: 'mg/dL', placeholder: '1.0', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'map', labelKey: 'sofaMap', unit: 'mmHg', placeholder: '75', min: 0, step: 1, inputMode: 'numeric' },
  { id: 'dopamine', labelKey: 'sofaDopamine', unit: 'µg/kg/min', placeholder: '0', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'dobutamine', labelKey: 'sofaDobutamine', unit: 'µg/kg/min', placeholder: '0', min: 0, step: 0.1, inputMode: 'decimal' },
  { id: 'epinephrine', labelKey: 'sofaEpinephrine', unit: 'µg/kg/min', placeholder: '0', min: 0, step: 0.01, inputMode: 'decimal' },
  { id: 'norepinephrine', labelKey: 'sofaNorepinephrine', unit: 'µg/kg/min', placeholder: '0', min: 0, step: 0.01, inputMode: 'decimal' },
  { id: 'gcs', labelKey: 'sofaGcs', placeholder: '15', min: 3, max: 15, step: 1, inputMode: 'numeric' },
  { id: 'creatinine', labelKey: 'meldNaCreatinine', unit: 'mg/dL', placeholder: '1.0', min: 0, step: 0.01, inputMode: 'decimal' },
  { id: 'urineOutput', labelKey: 'sofaUrineOutput', unit: 'mL/day', placeholder: '1500', min: 0, step: 10, inputMode: 'numeric' },
];

function optional(values: Record<string, string>, id: string): number {
  const raw = values[id];
  if (raw === undefined || raw.trim() === '') return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function calculate(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const pao2 = validateNumberField(values.pao2, { required: true, min: 0, exclusiveMin: true });
  const fio2 = validateNumberField(values.fio2, { required: true, min: 21, max: 100 });
  const respiratorySupport = validateSelectField(values.respiratorySupport, ['1', '0']);
  const platelets = validateNumberField(values.platelets, { required: true, min: 0 });
  const bilirubin = validateNumberField(values.bilirubin, { required: true, min: 0, exclusiveMin: true });
  const map = validateNumberField(values.map, { required: true, min: 0 });
  const gcs = validateNumberField(values.gcs, { required: true, min: 3, max: 15 });
  const creatinine = validateNumberField(values.creatinine, { required: true, min: 0, exclusiveMin: true });
  const urineOutput = validateNumberField(values.urineOutput, { min: 0 });

  assignError(errors, 'pao2', pao2);
  assignError(errors, 'fio2', fio2);
  assignError(errors, 'respiratorySupport', respiratorySupport);
  assignError(errors, 'platelets', platelets);
  assignError(errors, 'bilirubin', bilirubin);
  assignError(errors, 'map', map);
  assignError(errors, 'gcs', gcs);
  assignError(errors, 'creatinine', creatinine);
  assignError(errors, 'urineOutput', urineOutput);

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (
    !pao2.ok || pao2.value === null ||
    !fio2.ok || fio2.value === null ||
    !platelets.ok || platelets.value === null ||
    !bilirubin.ok || bilirubin.value === null ||
    !map.ok || map.value === null ||
    !gcs.ok || gcs.value === null ||
    !creatinine.ok || creatinine.value === null
  ) {
    return { ok: false, errors };
  }

  const result = calculateSofa({
    pao2MmHg: pao2.value,
    fio2Percent: fio2.value,
    respiratorySupport: (respiratorySupport.ok ? respiratorySupport.value : '0') === '1',
    platelets: platelets.value,
    bilirubinMgDl: bilirubin.value,
    mapMmHg: map.value,
    dopamine: optional(values, 'dopamine'),
    dobutamine: optional(values, 'dobutamine'),
    epinephrine: optional(values, 'epinephrine'),
    norepinephrine: optional(values, 'norepinephrine'),
    gcs: gcs.value,
    creatinineMgDl: creatinine.value,
    urineOutputMl: urineOutput.ok && urineOutput.value !== null ? urineOutput.value : undefined,
  });

  return {
    ok: true,
    metrics: [
      { id: 'total', labelKey: 'sofaTotal', value: String(result.total), primary: true },
      { id: 'respiratory', labelKey: 'sofaRespiratoryShort', value: String(result.respiratory) },
      { id: 'coagulation', labelKey: 'sofaCoagulationShort', value: String(result.coagulation) },
      { id: 'liver', labelKey: 'sofaLiverShort', value: String(result.liver) },
      { id: 'cardiovascular', labelKey: 'sofaCardiovascularShort', value: String(result.cardiovascular) },
      { id: 'cns', labelKey: 'sofaCnsShort', value: String(result.cns) },
      { id: 'renal', labelKey: 'sofaRenalShort', value: String(result.renal) },
    ],
    working: `Resp ${result.respiratory} + Coag ${result.coagulation} + Liver ${result.liver} + Cardio ${result.cardiovascular} + CNS ${result.cns} + Renal ${result.renal} = ${result.total}`,
    interpretationKey: 'sofaInterpretation',
    data: { score: result.total },
  };
}

export const sofaCalculator: CalculatorDefinition = {
  id: 'sofa',
  slug: 'sofa',
  categoryKey: 'clinicalScores',
  titleKey: 'sofaTitle',
  descriptionKey: 'sofaDescription',
  fields,
  formula: 'SOFA = respiratory + coagulation + liver + cardiovascular + CNS + renal (0–4 each)',
  formulaDescriptionKey: 'sofaFormulaDescription',
  interpretationKey: 'sofaInterpretation',
  clinicalNoteKey: 'sofaClinicalNote',
  source: 'Sequential Organ Failure Assessment (Vincent et al., 1996).',
  calculate,
};
