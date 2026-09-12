'use client';

import { Download, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useLocale } from '@/lib/i18n/useLocale';
import { cn } from '@/lib/utils/cn';
import type { CalculatorDefinition, CalculatorErrors } from '@/lib/calculators/types';

interface CalculatorInputsProps {
  calculator: CalculatorDefinition;
  values: Record<string, string>;
  touched: Record<string, boolean>;
  errors: CalculatorErrors;
  hasInput: boolean;
  onChange: (id: string, value: string) => void;
  onBlur: (id: string) => void;
  onReset: () => void;
}

export function CalculatorInputs({
  calculator,
  values,
  touched,
  errors,
  hasInput,
  onChange,
  onBlur,
  onReset,
}: CalculatorInputsProps) {
  const { language, t } = useLocale();

  return (
    <section
      className="rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-[#304950] dark:bg-[#172a30] sm:p-7"
      aria-labelledby="calculator-inputs-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="calculator-inputs-heading" className="font-bold">{t('calculatorInputs')}</h2>
          <p className="mt-1 text-xs text-[#64748b] dark:text-[#a9bbc1]">
            {t('calculatorInputsDescription')}
          </p>
        </div>
        {hasInput && (
          <Button variant="ghost" size="sm" type="button" onClick={onReset}>
            <RotateCcw size={14} />
            {t('reset')}
          </Button>
        )}
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {calculator.fields.map((field) => {
          const errorKey = errors[field.id];
          const showError = Boolean(errorKey) && (touched[field.id] || values[field.id]?.trim() !== '');
          const errorId = `${calculator.id}-${field.id}-error`;
          const fieldId = `${calculator.id}-${field.id}`;
          const isSelect = field.type === 'select';

          return (
            <label key={field.id} className="text-xs font-bold text-[#334155] dark:text-[#d7e3e6]">
              <span>{t(field.labelKey)}</span>

              {isSelect ? (
                <select
                  id={fieldId}
                  value={values[field.id] ?? ''}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  onBlur={() => onBlur(field.id)}
                  aria-invalid={showError}
                  aria-describedby={showError ? errorId : undefined}
                  className={cn(
                    'mt-2 w-full rounded-xl border bg-transparent px-3 py-3 text-sm outline-none transition focus:ring-2',
                    showError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#dce7eb] focus:border-[#0e7490] focus:ring-[#0e7490]/20'
                  )}
                >
                  <option value="" disabled>{t('selectOptionPlaceholder')}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value} - {field.optionLabel ? field.optionLabel(language, option) : t(option.labelKey)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="relative mt-2">
                  <input
                    id={fieldId}
                    value={values[field.id] ?? ''}
                    onChange={(event) => onChange(field.id, event.target.value)}
                    onBlur={() => onBlur(field.id)}
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    inputMode={field.inputMode}
                    placeholder={field.placeholder}
                    aria-invalid={showError}
                    aria-describedby={showError ? errorId : undefined}
                    className={cn(
                      'w-full rounded-xl border bg-transparent px-3 py-3 text-sm outline-none transition focus:ring-2',
                      showError
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-[#dce7eb] focus:border-[#0e7490] focus:ring-[#0e7490]/20',
                      field.unit ? 'pr-14' : 'pr-3'
                    )}
                  />
                  {field.unit && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8]">
                      {field.unit}
                    </span>
                  )}
                </div>
              )}

              {showError && errorKey && (
                <span id={errorId} className="mt-1.5 block text-[11px] font-semibold text-red-500">
                  {t(errorKey)}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
