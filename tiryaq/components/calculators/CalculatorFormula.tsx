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
      className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl dark:border-[#1E2A38] dark:bg-[#131F2E] sm:p-7"
      aria-labelledby="calculator-formula-heading"
    >
      <h2 id="calculator-formula-heading" className="font-bold">{t('formula')}</h2>
      <p className="mt-4 rounded-xl border border-[#0369A1]/25 bg-[#0369A1]/10 px-4 py-4 text-center font-mono text-sm font-semibold text-[#075985] dark:border-[#1E3A47] dark:bg-[#0B2436] dark:text-[#7DD3FC]">
        {calculator.formula}
      </p>
      <p className="mt-4 text-sm leading-6 text-[#5B7184] dark:text-[#9FB0BF]">
        {t(calculator.formulaDescriptionKey)}
      </p>
      {calculator.source && (
        <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#5B7184]">
          <Info size={13} className="mt-0.5 shrink-0" />
          {calculator.source}
        </p>
      )}
    </section>
  );
}
