'use client';

import { AlertTriangle, Info } from 'lucide-react';

import { useLocale } from '@/lib/i18n/useLocale';
import type { CalculationOutcome, CalculatorDefinition } from '@/lib/calculators/types';

interface CalculatorInterpretationProps {
  calculator: CalculatorDefinition;
  outcome: CalculationOutcome;
}

export function CalculatorInterpretation({ calculator, outcome }: CalculatorInterpretationProps) {
  const { t } = useLocale();
  const interpretationKey = outcome.ok && outcome.interpretationKey
    ? outcome.interpretationKey
    : calculator.interpretationKey;

  return (
    <section
      className="mt-5 rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-[#304950] dark:bg-[#172a30] sm:p-7"
      aria-labelledby="calculator-interpretation-heading"
    >
      <h2 id="calculator-interpretation-heading" className="font-bold">{t('clinicalInterpretation')}</h2>
      <p className="mt-3 text-sm leading-6 text-[#64748b] dark:text-[#a9bbc1]">{t(interpretationKey)}</p>

      {calculator.clinicalNoteKey && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-5 text-amber-700 dark:border-[#3b555b] dark:bg-[#20363d] dark:text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {t(calculator.clinicalNoteKey)}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#dce7eb] bg-[#f8fafc] p-4 text-[11px] leading-5 text-[#64748b] dark:border-[#304950] dark:bg-[#20363d] dark:text-[#a9bbc1]">
        <Info size={14} className="mt-0.5 shrink-0 text-[#0e7490]" />
        {t('interpretationCaveat')}
      </div>
    </section>
  );
}
