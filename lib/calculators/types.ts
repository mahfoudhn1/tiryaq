import type { TranslationKey } from '@/lib/i18n/translations';
import type { Language } from '@/store/slices/localeSlice';

/** A selectable option for a `select` field (e.g. a GCS component score). */
export interface CalculatorOption {
  value: string;
  labelKey: TranslationKey;
}

/**
 * A single input rendered by the generic calculator view. Defaults to a
 * numeric input; set `type: 'select'` to render a dropdown of fixed options.
 * Labels/units are language-neutral metadata; only the labels are translated.
 */
export interface CalculatorField {
  id: string;
  /** Input control to render. Defaults to `'number'`. */
  type?: 'number' | 'select';
  /** Translation key for the visible field label. */
  labelKey: TranslationKey;
  /** Unit suffix rendered inside the input, e.g. "mmHg". */
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  inputMode?: 'decimal' | 'numeric';
  /** Required when `type` is `'select'`. */
  options?: readonly CalculatorOption[];
  /**
   * Optional locale-aware label resolver for select options. Use when an option
   * label depends on another option's value (e.g. the GCS component description
   * differs by score for each language).
   */
  optionLabel?: (language: Language, option: CalculatorOption) => string;
}

/** One output metric produced by a calculator. */
export interface CalculatorMetric {
  id: string;
  labelKey: TranslationKey;
  value: string;
  unit?: string;
  /** Rendered as the headline value. */
  primary?: boolean;
}

export type CalculatorErrors = Record<string, TranslationKey>;

/**
 * Machine-readable values emitted by a successful calculation, so one
 * calculator's output can be consumed programmatically (e.g. a future Parkland
 * calculator reading a TBSA percentage) without re-parsing displayed strings.
 */
export type CalculatorData = Record<string, number>;

export type CalculationOutcome =
  | {
      ok: true;
      metrics: CalculatorMetric[];
      /** Optional inline working, e.g. "(120 + 2 × 80) / 3 = 93.3 mmHg". */
      working?: string;
      /**
       * Overrides the default interpretation text when the result (rather than
       * the score range) determines the guidance, e.g. a GCS band.
       */
      interpretationKey?: TranslationKey;
      /** Non-blocking advisory messages shown in the result card. */
      warnings?: TranslationKey[];
      /** Structured numeric outputs keyed by a stable id. */
      data?: CalculatorData;
    }
  | { ok: false; errors: CalculatorErrors };

/** Collects a field value from another calculator's stored result. */
export interface CalculatorImport {
  /** Calculator id whose stored result should be read. */
  sourceCalculatorId: string;
  /** Key within that result's `data`. */
  sourceDataKey: string;
  /** Translation key for the "import" affordance label. */
  labelKey: TranslationKey;
}

/**
 * Language-neutral, client-side calculator definition. Adding a calculator is
 * a matter of implementing one of these and registering it, with no changes to
 * routing or presentation.
 */
export interface CalculatorDefinition {
  id: string;
  /** URL segment, e.g. /emergency/<slug>. */
  slug: string;
  categoryKey: TranslationKey;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  fields: readonly CalculatorField[];
  /** Optional per-field import from another calculator's structured result. */
  imports?: Record<string, CalculatorImport>;
  /** Literal mathematical formula shown in the formula section. */
  formula: string;
  formulaDescriptionKey: TranslationKey;
  interpretationKey: TranslationKey;
  /**
   * Optional advisory note always shown beneath the interpretation, for
   * context that applies regardless of the calculated result.
   */
  clinicalNoteKey?: TranslationKey;
  /** Optional citation for the method. */
  source?: string;
  /** Pure, deterministic validation + calculation. */
  calculate: (values: Record<string, string>) => CalculationOutcome;
}
