'use client';

import { Info } from 'lucide-react';

import { useLocale } from '@/lib/i18n/useLocale';
import type { CalculatorDefinition } from '@/lib/calculators/types';

interface CalculatorFormulaProps {
  calculator: CalculatorDefinition;
}

export function CalculatorFormula({ calculator }: CalculatorFormulaProps) {
  const { t } = useLocale();

  return (
    <section
      className="rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-[#304950] dark:bg-[#172a30] sm:p-7"
      aria-labelledby="calculator-formula-heading"
    >
      <h2 id="calculator-formula-heading" className="font-bold">{t('formula')}</h2>
      <p className="mt-4 rounded-xl border border-[#b7e1e3] bg-[#f0fdfd] px-4 py-4 text-center font-mono text-sm font-semibold text-[#0e7490] dark:border-[#285b63] dark:bg-[#16424a] dark:text-[#8ed7d7]">
        {calculator.formula}
      </p>
      <p className="mt-4 text-sm leading-6 text-[#64748b] dark:text-[#a9bbc1]">
        {t(calculator.formulaDescriptionKey)}
      </p>
      {calculator.source && (
        <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#94a3b8]">
          <Info size={13} className="mt-0.5 shrink-0" />
          {calculator.source}
        </p>
      )}
    </section>
  );
}
