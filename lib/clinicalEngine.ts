// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DosingRule {
  medication_dci: string;
  min_age_months?: number;
  max_age_months?: number;
  min_weight_kg?: number;
  max_weight_kg?: number;
  dose_mg_per_kg?: number;
  fixed_dose_mg?: number;
  max_single_dose_mg?: number;
  max_daily_dose_mg?: number;
  max_daily_dose_mg_per_kg?: number;
  frequency_per_day?: number;
  interval_hours?: number;
  concentration_mg_per_ml?: number;
  stock_concentration_mg_per_ml?: number;
  /** Required: where this rule's numbers came from (formulary, edition, page/section, review date). */
  source: string;
}

export interface Patient {
  age_months: number;
  weight_kg: number;
  height_cm?: number;
}

export interface DoseResult {
  dose_mg: number;
  daily_dose_mg: number;
  volume_ml: number | null;
  frequency_per_day: number | null;
  interval_hours: number | null;
  capped_by_single_dose: boolean;
  capped_by_daily_dose: boolean;
  warnings: string[];
}

/**
 * Result of trying to dose a real patient against the rule table.
 * Discriminated union so callers are forced to handle the "no rule" case
 * instead of a null/throw being silently ignored.
 */
export type DoseOutcome =
  | { ok: true; rule: DosingRule; result: DoseResult }
  | { ok: false; reason: 'no_matching_rule' | 'ambiguous_rules'; medicationDci: string };

// Extreme-input thresholds used only to generate warnings, not to block calculation.
const EXTREME_LOW_WEIGHT_KG = 3;
const EXTREME_HIGH_WEIGHT_KG = 120;
const EXTREME_LOW_AGE_MONTHS = 1;
const MIN_PRACTICALLY_MEASURABLE_ML = 0.1;

// ---------------------------------------------------------------------------
// Rule table
// ---------------------------------------------------------------------------

export const DOSING_RULES: readonly DosingRule[] = [
  {
    medication_dci: 'PARACETAMOL',
    min_age_months: 1,
    max_age_months: 2160,
    dose_mg_per_kg: 15,
    max_single_dose_mg: 1000,
    max_daily_dose_mg: 4000,
    frequency_per_day: 4,
    stock_concentration_mg_per_ml: 24,
    source: 'REPLACE_ME: e.g. BNF for Children 2024/25, paracetamol, oral, reviewed 2026-XX-XX',
  },
  {
    medication_dci: 'IBUPROFENE',
    min_age_months: 6,
    max_age_months: 2160,
    dose_mg_per_kg: 10,
    max_single_dose_mg: 400,
    max_daily_dose_mg: 1200,
    frequency_per_day: 3,
    stock_concentration_mg_per_ml: 20,
    source: 'REPLACE_ME: e.g. BNF for Children 2024/25, ibuprofen, oral, reviewed 2026-XX-XX',
  },
];

// ---------------------------------------------------------------------------
// Rule-table validation (run this in a test, and ideally at startup)
// ---------------------------------------------------------------------------

export interface RuleValidationIssue {
  medication_dci: string;
  message: string;
}

/**
 * Checks the rule table itself for problems that would otherwise fail silently
 * at calculation time: overlapping ranges for the same drug, and internally
 * inconsistent dose/frequency/interval fields on a single rule.
 * Call this in a unit test so a bad rule addition fails CI, not a real dose.
 */
export function validateDosingRules(rules: readonly DosingRule[]): RuleValidationIssue[] {
  const issues: RuleValidationIssue[] = [];

  for (const rule of rules) {
    if (!rule.source || rule.source.trim() === '') {
      issues.push({ medication_dci: rule.medication_dci, message: 'Missing source citation.' });
    }
    if (rule.dose_mg_per_kg === undefined && rule.fixed_dose_mg === undefined) {
      issues.push({ medication_dci: rule.medication_dci, message: 'Neither dose_mg_per_kg nor fixed_dose_mg is set.' });
    }
    if (rule.dose_mg_per_kg !== undefined && rule.fixed_dose_mg !== undefined) {
      issues.push({ medication_dci: rule.medication_dci, message: 'Both dose_mg_per_kg and fixed_dose_mg are set; only one should be.' });
    }
    if (rule.frequency_per_day !== undefined && rule.interval_hours !== undefined) {
      const impliedFrequency = 24 / rule.interval_hours;
      if (Math.abs(impliedFrequency - rule.frequency_per_day) > 0.01) {
        issues.push({
          medication_dci: rule.medication_dci,
          message: `frequency_per_day (${rule.frequency_per_day}) and interval_hours (${rule.interval_hours}) disagree.`,
        });
      }
    }
    if (
      rule.max_single_dose_mg !== undefined &&
      rule.max_daily_dose_mg !== undefined &&
      rule.frequency_per_day !== undefined &&
      rule.max_single_dose_mg * rule.frequency_per_day < rule.max_daily_dose_mg * 0.5
    ) {
      // The single-dose cap alone can't reach even half the stated daily cap at the given
      // frequency; likely a typo in one of the three fields.
      issues.push({
        medication_dci: rule.medication_dci,
        message: 'max_single_dose_mg * frequency_per_day is far below max_daily_dose_mg; check for a typo.',
      });
    }
    if (
      rule.min_age_months !== undefined &&
      rule.max_age_months !== undefined &&
      rule.min_age_months > rule.max_age_months
    ) {
      issues.push({ medication_dci: rule.medication_dci, message: 'min_age_months is greater than max_age_months.' });
    }
    if (
      rule.min_weight_kg !== undefined &&
      rule.max_weight_kg !== undefined &&
      rule.min_weight_kg > rule.max_weight_kg
    ) {
      issues.push({ medication_dci: rule.medication_dci, message: 'min_weight_kg is greater than max_weight_kg.' });
    }
  }

  // Overlap check: any two rules for the same drug whose age AND weight ranges both overlap.
  const byDrug = new Map<string, DosingRule[]>();
  for (const rule of rules) {
    const key = rule.medication_dci.trim().toUpperCase();
    const list = byDrug.get(key) ?? [];
    list.push(rule);
    byDrug.set(key, list);
  }
  for (const [drug, drugRules] of byDrug) {
    for (let i = 0; i < drugRules.length; i++) {
      for (let j = i + 1; j < drugRules.length; j++) {
        if (rangesOverlap(drugRules[i], drugRules[j])) {
          issues.push({
            medication_dci: drug,
            message: `Two rules have overlapping age/weight ranges (indices ${i} and ${j}); findDosingRule would pick one arbitrarily.`,
          });
        }
      }
    }
  }

  return issues;
}

function rangesOverlap(a: DosingRule, b: DosingRule): boolean {
  const ageOverlap =
    (a.min_age_months ?? -Infinity) <= (b.max_age_months ?? Infinity) &&
    (b.min_age_months ?? -Infinity) <= (a.max_age_months ?? Infinity);
  const weightOverlap =
    (a.min_weight_kg ?? -Infinity) <= (b.max_weight_kg ?? Infinity) &&
    (b.min_weight_kg ?? -Infinity) <= (a.max_weight_kg ?? Infinity);
  return ageOverlap && weightOverlap;
}

// ---------------------------------------------------------------------------
// Rule lookup
// ---------------------------------------------------------------------------

/**
 * Finds every rule matching the drug + patient. Exposed (rather than hidden
 * inside findDosingRule) so callers/tests can detect ambiguity instead of
 * silently taking the first match.
 */
export function findMatchingRules(medicationDci: string, patient: Patient, rules: readonly DosingRule[]): DosingRule[] {
  const medication = medicationDci.trim().toUpperCase();
  return rules.filter((rule) => {
    if (rule.medication_dci.trim().toUpperCase() !== medication) return false;
    if (rule.min_age_months !== undefined && patient.age_months < rule.min_age_months) return false;
    if (rule.max_age_months !== undefined && patient.age_months > rule.max_age_months) return false;
    if (rule.min_weight_kg !== undefined && patient.weight_kg < rule.min_weight_kg) return false;
    if (rule.max_weight_kg !== undefined && patient.weight_kg > rule.max_weight_kg) return false;
    return true;
  });
}

/** @deprecated Use findMatchingRules + explicit ambiguity handling, or dosePatient(). */
export function findDosingRule(medicationDci: string, patient: Patient, rules: readonly DosingRule[]): DosingRule | null {
  const matches = findMatchingRules(medicationDci, patient, rules);
  return matches[0] ?? null;
}

// ---------------------------------------------------------------------------
// Dose calculation
// ---------------------------------------------------------------------------

/**
 * Single entry point for the whole app: looks up the rule for this patient
 * and drug, and returns either a computed dose or a typed reason it couldn't.
 * Callers must handle both branches — there is no silent null/throw path.
 */
export function dosePatient(medicationDci: string, patient: Patient, rules: readonly DosingRule[] = DOSING_RULES): DoseOutcome {
  validatePatient(patient);
  const matches = findMatchingRules(medicationDci, patient, rules);

  if (matches.length === 0) {
    return { ok: false, reason: 'no_matching_rule', medicationDci };
  }
  if (matches.length > 1) {
    return { ok: false, reason: 'ambiguous_rules', medicationDci };
  }

  const rule = matches[0];
  return { ok: true, rule, result: calculateDose(patient, rule) };
}

export function calculateDose(patient: Patient, rule: DosingRule): DoseResult {
  validatePatient(patient);
  const warnings: string[] = [...getInputSanityWarnings(patient)];

  let doseMg = getInitialDose(patient, rule);
  let cappedBySingleDose = false;

  if (rule.max_single_dose_mg !== undefined && doseMg > rule.max_single_dose_mg) {
    doseMg = rule.max_single_dose_mg;
    cappedBySingleDose = true;
    warnings.push('The calculated dose was reduced to the maximum single dose.');
  }

  const frequencyPerDay = getFrequency(rule);
  const maximumDailyDose = getMaximumDailyDose(patient, rule);
  let cappedByDailyDose = false;

  if (maximumDailyDose !== null && frequencyPerDay !== null) {
    const maximumDoseFromDailyLimit = maximumDailyDose / frequencyPerDay;
    if (doseMg > maximumDoseFromDailyLimit) {
      doseMg = maximumDoseFromDailyLimit;
      cappedByDailyDose = true;
      warnings.push('The calculated dose was reduced to remain within the maximum daily dose.');
    }
  }

  const dailyDoseMg = frequencyPerDay === null ? doseMg : doseMg * frequencyPerDay;
  const concentration = rule.concentration_mg_per_ml ?? rule.stock_concentration_mg_per_ml;
  const volumeMl = concentration === undefined ? null : calculateLiquidVolume(doseMg, concentration);

  if (volumeMl !== null && volumeMl > 0 && volumeMl < MIN_PRACTICALLY_MEASURABLE_ML) {
    warnings.push(`Calculated volume (${volumeMl} mL) is very small and may be hard to measure accurately with a standard syringe.`);
  }

  return {
    dose_mg: round(doseMg, 2),
    daily_dose_mg: round(dailyDoseMg, 2),
    volume_ml: volumeMl,
    frequency_per_day: frequencyPerDay === null ? null : round(frequencyPerDay, 2),
    interval_hours: getInterval(rule),
    capped_by_single_dose: cappedBySingleDose,
    capped_by_daily_dose: cappedByDailyDose,
    warnings,
  };
}

export function calculateLiquidVolume(doseMg: number, concentrationMgPerMl: number): number {
  if (doseMg <= 0 || concentrationMgPerMl <= 0) return 0;
  return round(doseMg / concentrationMgPerMl, 2);
}

export function calculateBsa(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  return round(Math.sqrt((heightCm * weightKg) / 3600), 3);
}

export function calculateDosingInterval(frequencyPerDay: number): number {
  if (frequencyPerDay <= 0) return 0;
  return 24 / frequencyPerDay;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getInitialDose(patient: Patient, rule: DosingRule): number {
  if (rule.dose_mg_per_kg !== undefined) return patient.weight_kg * rule.dose_mg_per_kg;
  if (rule.fixed_dose_mg !== undefined) return rule.fixed_dose_mg;
  throw new Error('Dosing rule has no dose_mg_per_kg or fixed_dose_mg.');
}

function getMaximumDailyDose(patient: Patient, rule: DosingRule): number | null {
  const limits: number[] = [];
  if (rule.max_daily_dose_mg_per_kg !== undefined) limits.push(patient.weight_kg * rule.max_daily_dose_mg_per_kg);
  if (rule.max_daily_dose_mg !== undefined) limits.push(rule.max_daily_dose_mg);
  return limits.length === 0 ? null : Math.min(...limits);
}

function getFrequency(rule: DosingRule): number | null {
  if (rule.frequency_per_day !== undefined && rule.frequency_per_day > 0) return rule.frequency_per_day;
  if (rule.interval_hours !== undefined && rule.interval_hours > 0) return 24 / rule.interval_hours;
  return null;
}

function getInterval(rule: DosingRule): number | null {
  if (rule.interval_hours !== undefined && rule.interval_hours > 0) return rule.interval_hours;
  if (rule.frequency_per_day !== undefined && rule.frequency_per_day > 0) return 24 / rule.frequency_per_day;
  return null;
}

function getInputSanityWarnings(patient: Patient): string[] {
  const warnings: string[] = [];
  if (patient.weight_kg < EXTREME_LOW_WEIGHT_KG) {
    warnings.push(`Weight (${patient.weight_kg} kg) is very low; verify this rule is appropriate for a patient this small and consider specialist input.`);
  }
  if (patient.weight_kg > EXTREME_HIGH_WEIGHT_KG) {
    warnings.push(`Weight (${patient.weight_kg} kg) is unusually high; double-check the entered value.`);
  }
  if (patient.age_months < EXTREME_LOW_AGE_MONTHS) {
    warnings.push('Patient is under 1 month old (neonate); neonatal dosing often differs from standard pediatric rules and should be verified separately.');
  }
  return warnings;
}

function validatePatient(patient: Patient): void {
  if (!Number.isFinite(patient.age_months) || patient.age_months < 0) throw new Error('Invalid age.');
  if (!Number.isFinite(patient.weight_kg) || patient.weight_kg <= 0) throw new Error('Weight must be greater than zero.');
  if (patient.height_cm !== undefined && (!Number.isFinite(patient.height_cm) || patient.height_cm <= 0)) throw new Error('Height must be greater than zero.');
}

function round(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}