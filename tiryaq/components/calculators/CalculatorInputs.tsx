'use client';

import { RotateCcw } from 'lucide-react';

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
      className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl dark:border-[#1E2A38] dark:bg-[#131F2E] sm:p-7"
      aria-labelledby="calculator-inputs-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="calculator-inputs-heading" className="font-bold">{t('calculatorInputs')}</h2>
          <p className="mt-1 text-xs text-[#5B7184] dark:text-[#9FB0BF]">
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
            <label key={field.id} className="text-xs font-bold text-[#5B7184] dark:text-[#EAF1F7]">
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
                    'mt-2 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none transition focus:ring-2',
                    showError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-[#0369A1]/15 focus:border-[#0369A1] focus:ring-[#0369A1]/20'
                  )}
                >
                  <option value="" disabled={field.required !== false}>
                    {t('selectOptionPlaceholder')}
                  </option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {field.showOptionValue === false ? '' : `${option.value} - `}
                      {field.optionLabel ? field.optionLabel(language, option) : t(option.labelKey)}
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
                      'w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none transition focus:ring-2',
                      showError
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-[#0369A1]/15 focus:border-[#0369A1] focus:ring-[#0369A1]/20',
                      field.unit ? 'pr-14' : 'pr-3'
                    )}
                  />
                  {field.unit && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5B7184]">
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
