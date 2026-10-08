import type { CalculatorErrors } from './types';
import type { TranslationKey } from '@/lib/i18n/translations';

export const REQUIRED_FIELD_ERROR: TranslationKey = 'valueRequiredError';
export const INVALID_NUMBER_ERROR: TranslationKey = 'invalidNumberError';
export const POSITIVE_VALUE_ERROR: TranslationKey = 'mustBePositiveError';

export function isEmpty(value: string | undefined): boolean {
  return value === undefined || value.trim() === '';
}

export function parseNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export interface NumberFieldRules {
  /** When true, an empty value is an error. Defaults to false. */
  required?: boolean;
  /** Inclusive lower bound. */
  min?: number;
  /** When true, the lower bound is exclusive (value must be strictly greater). */
  exclusiveMin?: boolean;
  /** Inclusive upper bound. */
  max?: number;
  requiredError?: TranslationKey;
  invalidError?: TranslationKey;
  minError?: TranslationKey;
  maxError?: TranslationKey;
}

export type NumberFieldResult =
  | { ok: true; value: number | null }
  | { ok: false; error: TranslationKey };

/**
 * Reusable single-field numeric validation shared by all calculators.
 * Returns the parsed value (or null for an allowed empty field) on success,
 * or a translation key describing the first rule that failed.
 */
export function validateNumberField(
  raw: string | undefined,
  rules: NumberFieldRules = {}
): NumberFieldResult {
  if (isEmpty(raw)) {
    return rules.required
      ? { ok: false, error: rules.requiredError ?? REQUIRED_FIELD_ERROR }
      : { ok: true, value: null };
  }

  const parsed = parseNumber(raw);
  if (parsed === null) {
    return { ok: false, error: rules.invalidError ?? INVALID_NUMBER_ERROR };
  }

  if (rules.min !== undefined) {
    const belowMin = rules.exclusiveMin ? parsed <= rules.min : parsed < rules.min;
    if (belowMin) {
      return { ok: false, error: rules.minError ?? POSITIVE_VALUE_ERROR };
    }
  }

  if (rules.max !== undefined && parsed > rules.max) {
    return { ok: false, error: rules.maxError ?? 'exceedsMaxError' };
  }

  return { ok: true, value: parsed };
}

/** Collects field errors, ignoring any that are undefined. */
export function assignError(
  errors: CalculatorErrors,
  fieldId: string,
  result: { ok: true } | { ok: false; error: TranslationKey }
): void {
  if (!result.ok) errors[fieldId] = result.error;
}

export const INVALID_OPTION_ERROR: TranslationKey = 'invalidSelectionError';

export type SelectFieldResult =
  | { ok: true; value: string | null }
  | { ok: false; error: TranslationKey };

/**
 * Reusable single-field select validation. Ensures a choice was made (when
 * required) and that it is one of the declared options, so impossible values
 * cannot be scored.
 */
export function validateSelectField(
  raw: string | undefined,
  allowed: readonly string[],
  options: { required?: boolean } = {}
): SelectFieldResult {
  const value = raw?.trim() ?? '';
  const required = options.required !== false;

  if (value === '') {
    return required
      ? { ok: false, error: REQUIRED_FIELD_ERROR }
      : { ok: true, value: null };
  }

  if (!allowed.includes(value)) {
    return { ok: false, error: INVALID_OPTION_ERROR };
  }

  return { ok: true, value };
}

