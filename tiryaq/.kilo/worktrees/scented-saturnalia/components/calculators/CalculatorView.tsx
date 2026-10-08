'use client';

import { useMemo, useState } from 'react';

import { CalculatorFormula } from '@/components/calculators/CalculatorFormula';
import { CalculatorHeader } from '@/components/calculators/CalculatorHeader';
import { CalculatorInputs } from '@/components/calculators/CalculatorInputs';
import { CalculatorInterpretation } from '@/components/calculators/CalculatorInterpretation';
import { CalculatorResult } from '@/components/calculators/CalculatorResult';
import { useLocale } from '@/lib/i18n/useLocale';
import type { CalculatorDefinition } from '@/lib/calculators/types';

interface CalculatorViewProps {
  calculator: CalculatorDefinition;
}

function emptyValues(calculator: CalculatorDefinition): Record<string, string> {
  return Object.fromEntries(
    calculator.fields.map((field) => [field.id, field.defaultValue ?? ''])
  );
}

export function CalculatorView({ calculator }: CalculatorViewProps) {
  const { language } = useLocale();
  const [values, setValues] = useState<Record<string, string>>(() => emptyValues(calculator));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const outcome = useMemo(() => calculator.calculate(values), [calculator, values]);
  const errors = outcome.ok ? {} : outcome.errors;
  const hasInput = calculator.fields.some((field) => {
    const value = values[field.id]?.trim() ?? '';
    if (value === '') return false;
    return field.defaultValue === undefined || value !== field.defaultValue;
  });

  const updateField = (id: string, value: string) => {
    setValues((previous) => ({ ...previous, [id]: value }));
  };

  const reset = () => {
    setValues(emptyValues(calculator));
    setTouched({});
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen bg-[#f4f8f8] px-4 py-6 text-[#0f172a] dark:bg-[#0d1b1f] dark:text-[#e2e8f0] sm:px-6 lg:px-10 lg:py-10"
    >
      <div className="mx-auto max-w-5xl">
        <CalculatorHeader calculator={calculator} />
        <div className="grid gap-5 lg:grid-cols-2">
          <CalculatorInputs
            calculator={calculator}
            values={values}
            touched={touched}
            errors={errors}
            hasInput={hasInput}
            onChange={updateField}
            onBlur={(id) => setTouched((previous) => ({ ...previous, [id]: true }))}
            onReset={reset}
          />
          <CalculatorFormula calculator={calculator} />
        </div>
        <CalculatorResult calculator={calculator} outcome={outcome} hasInput={hasInput} />
        <CalculatorInterpretation calculator={calculator} outcome={outcome} />
      </div>
    </div>
  );
}
