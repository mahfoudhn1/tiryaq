import type {
  CalculationOutcome,
  CalculatorDefinition,
  CalculatorErrors,
  CalculatorField,
  CalculatorMetric,
} from './types';
import type { TranslationKey } from '@/lib/i18n/translations';
import { assignError, validateNumberField } from './validation';

/** Traditional Parkland formula: 4 mL × weight (kg) × TBSA (%) over 24 hours. */
export const PARKLAND_ML_PER_KG_PER_PERCENT = 4;
/** Fraction of the total given in the first 8 hours from the time of the burn. */
export const PARKLAND_FIRST_PHASE_FRACTION = 0.5;
/** Duration of the initial resuscitation phase, in hours from the burn. */
export const PARKLAND_FIRST_PHASE_HOURS = 8;
/** Total resuscitation window, in hours. */
export const PARKLAND_TOTAL_HOURS = 24;

const TIME_EXCEEDS_24_ERROR = 'timeExceeds24Error';
const FLUID_EXCEEDS_FIRST_PHASE_ERROR = 'fluidExceedsFirstPhaseError';
const ZERO_REMAINING_TIME_ERROR = 'zeroRemainingTimeError';

const fields: readonly CalculatorField[] = [
  {
    id: 'weight',
    labelKey: 'patientWeight',
    unit: 'kg',
    placeholder: '70',
    min: 0,
    step: 0.1,
    inputMode: 'decimal',
  },
  {
    id: 'tbsa',
    labelKey: 'burnTbsaInput',
    unit: '%',
    placeholder: '20',
    min: 0,
    max: 100,
    step: 0.5,
    inputMode: 'decimal',
  },
  {
    id: 'hoursSinceBurn',
    labelKey: 'timeSinceBurn',
    unit: 'h',
    placeholder: '2',
    min: 0,
    max: 24,
    step: 0.25,
    inputMode: 'decimal',
  },
  {
    id: 'fluidGiven',
    labelKey: 'fluidAlreadyGiven',
    unit: 'mL',
    placeholder: '0',
    min: 0,
    step: 10,
    inputMode: 'numeric',
  },
];

function round(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

function calculateParkland(values: Record<string, string>): CalculationOutcome {
  const errors: CalculatorErrors = {};

  const weight = validateNumberField(values.weight, {
    required: true,
    min: 0,
    exclusiveMin: true,
  });
  const tbsa = validateNumberField(values.tbsa, {
    required: true,
    min: 0,
    exclusiveMin: true,
    max: 100,
  });
  const hours = validateNumberField(values.hoursSinceBurn, {
    required: true,
    min: 0,
    max: 24,
    maxError: TIME_EXCEEDS_24_ERROR,
  });
  const fluid = validateNumberField(values.fluidGiven, { min: 0 });

  assignError(errors, 'weight', weight);
  assignError(errors, 'tbsa', tbsa);
  assignError(errors, 'hoursSinceBurn', hours);
  assignError(errors, 'fluidGiven', fluid);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const weightKg = weight.ok ? weight.value : null;
  const tbsaPercent = tbsa.ok ? tbsa.value : null;
  const hoursSinceBurn = hours.ok ? hours.value : null;
  const fluidGivenMl = (fluid.ok ? fluid.value : null) ?? 0;

  if (weightKg === null || tbsaPercent === null || hoursSinceBurn === null) {
    return { ok: false, errors };
  }

  const total24h = PARKLAND_ML_PER_KG_PER_PERCENT * weightKg * tbsaPercent;
  const firstPhase = total24h * PARKLAND_FIRST_PHASE_FRACTION;
  const secondPhase = total24h - firstPhase;

  const remainingHours = PARKLAND_FIRST_PHASE_HOURS - hoursSinceBurn;

  if (fluidGivenMl > firstPhase) {
    return { ok: false, errors: { fluidGiven: FLUID_EXCEEDS_FIRST_PHASE_ERROR } };
  }

  const remainingFirstPhase = firstPhase - fluidGivenMl;

  let remainingRate: number | null = null;
  if (remainingHours > 0) {
    remainingRate = remainingFirstPhase / remainingHours;
  } else if (fluidGivenMl < firstPhase) {
    // The 8-hour window has elapsed with volume still outstanding; there is no
    // remaining time to divide across, so a rate cannot be computed.
    return { ok: false, errors: { hoursSinceBurn: ZERO_REMAINING_TIME_ERROR } };
  }

  const metrics: CalculatorMetric[] = [
    {
      id: 'total24h',
      labelKey: 'total24hFluid',
      value: round(total24h, 0).toLocaleString('en-US'),
      unit: 'mL',
      primary: true,
    },
    {
      id: 'firstPhase',
      labelKey: 'firstEightHours',
      value: round(firstPhase, 0).toLocaleString('en-US'),
      unit: 'mL',
    },
    {
      id: 'secondPhase',
      labelKey: 'followingSixteenHours',
      value: round(secondPhase, 0).toLocaleString('en-US'),
      unit: 'mL',
    },
    {
      id: 'remainingFirstPhase',
      labelKey: 'remainingInitialVolume',
      value: round(remainingFirstPhase, 0).toLocaleString('en-US'),
      unit: 'mL',
    },
    ...(remainingRate !== null
      ? [
          {
            id: 'remainingRate',
            labelKey: 'remainingHourlyRate',
            value: round(remainingRate, 0).toLocaleString('en-US'),
            unit: 'mL/h',
          },
        ]
      : []),
  ];

  const warnings: TranslationKey[] = ['parklandTimingWarning', 'parklandEstimateWarning'];

  const rateText =
    remainingRate !== null
      ? `; remaining ${round(remainingFirstPhase, 0).toLocaleString('en-US')} mL over ${round(remainingHours, 2)} h = ${round(remainingRate, 0).toLocaleString('en-US')} mL/h`
      : '';

  return {
    ok: true,
    metrics,
    working: `4 × ${weightKg} kg × ${tbsaPercent}% = ${round(total24h, 0).toLocaleString('en-US')} mL over 24 h${rateText}`,
    data: {
      total24hMl: round(total24h, 2),
      firstPhaseMl: round(firstPhase, 2),
      secondPhaseMl: round(secondPhase, 2),
      remainingFirstPhaseMl: round(remainingFirstPhase, 2),
      remainingHours: round(Math.max(remainingHours, 0), 2),
      ...(remainingRate !== null ? { remainingRateMlPerHour: round(remainingRate, 1) } : {}),
    },
    warnings,
  };
}

export const parklandCalculator: CalculatorDefinition = {
  id: 'parkland',
  slug: 'parkland',
  categoryKey: 'emergencyAndTrauma',
  titleKey: 'parklandFormula',
  descriptionKey: 'parklandDescription',
  fields,
  imports: {
    tbsa: {
      sourceCalculatorId: 'burn-tbsa',
      sourceDataKey: 'tbsaPercent',
      labelKey: 'importFromBurnTbsa',
    },
  },
  formula: '4 mL × weight (kg) × TBSA (%) = total 24 h',
  formulaDescriptionKey: 'parklandFormulaDescription',
  interpretationKey: 'parklandInterpretation',
  clinicalNoteKey: 'parklandClinicalNote',
  source: 'Traditional Parkland formula: 4 mL/kg per % TBSA over the first 24 hours, half in the first 8 hours from the time of the burn.',
  calculate: calculateParkland,
};
