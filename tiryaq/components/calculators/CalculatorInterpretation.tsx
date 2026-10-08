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
      className="mt-5 rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl dark:border-[#1E2A38] dark:bg-[#131F2E] sm:p-7"
      aria-labelledby="calculator-interpretation-heading"
    >
      <h2 id="calculator-interpretation-heading" className="font-bold">{t('clinicalInterpretation')}</h2>
      <p className="mt-3 text-sm leading-6 text-[#5B7184] dark:text-[#9FB0BF]">{t(interpretationKey)}</p>

      {calculator.clinicalNoteKey && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-5 text-amber-700 dark:border-[#1E2A38] dark:bg-[#0F1D2B] dark:text-amber-200">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {t(calculator.clinicalNoteKey)}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#0369A1]/15 bg-[#0369A1]/10 p-4 text-[11px] leading-5 text-[#5B7184] dark:border-[#1E2A38] dark:bg-[#0F1D2B] dark:text-[#9FB0BF]">
        <Info size={14} className="mt-0.5 shrink-0 text-[#075985]" />
        {t('interpretationCaveat')}
      </div>
    </section>
  );
}
