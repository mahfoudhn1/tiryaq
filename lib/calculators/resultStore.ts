import type { CalculatorData } from './types';

const STORAGE_KEY = 'tiryaq-calculator-results';

type StoredResults = Record<string, CalculatorData>;

function read(): StoredResults {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as StoredResults) : {};
  } catch {
    return {};
  }
}

/**
 * Persists the structured output of a successful calculation so another
 * calculator can reuse it (e.g. the Burn TBSA percentage feeding Parkland).
 * Uses sessionStorage so values survive client-side navigation but not a new
 * tab, and works fully offline.
 */
export function saveCalculatorResult(calculatorId: string, data: CalculatorData): void {
  if (typeof window === 'undefined') return;
  try {
    const results = read();
    results[calculatorId] = data;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    // Storage may be unavailable (private mode/quota); sharing is best-effort.
  }
}

export function getCalculatorResult(calculatorId: string): CalculatorData | null {
  return read()[calculatorId] ?? null;
}
