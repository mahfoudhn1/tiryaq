'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';

import { useLocale } from '@/lib/i18n/useLocale';
import { cn } from '@/lib/utils/cn';
import type { CalculationOutcome, CalculatorDefinition } from '@/lib/calculators/types';

interface CalculatorResultProps {
  calculator: CalculatorDefinition;
  outcome: CalculationOutcome;
  hasInput: boolean;
}

export function CalculatorResult({ calculator, outcome, hasInput }: CalculatorResultProps) {
  const { t } = useLocale();

  return (
    <section
      className="mt-5 rounded-2xl bg-[#0f172a] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:p-7"
      aria-labelledby="calculator-result-heading"
      aria-live="polite"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#67e8f9]">{t('calculation')}</p>
      <h2 id="calculator-result-heading" className="mt-2 text-2xl font-bold">{t(calculator.titleKey)}</h2>

      {!outcome.ok ? (
        <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-[#b9c7d7]">
          {hasInput ? t('calculatorFixInputs') : t('calculatorEnterValues')}
        </div>
      ) : (
        <>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {outcome.metrics.map((metric) => (
              <div key={metric.id} className={cn('rounded-xl p-4', metric.primary ? 'bg-[#0e7490]' : 'bg-white/10')}>
                <p className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.12em]',
                  metric.primary ? 'text-[#b9eef0]' : 'text-[#9eb1bd]'
                )}>
                  {t(metric.labelKey)}
                </p>
                <p className="mt-2 text-4xl font-bold">
                  {metric.valueKey ? t(metric.valueKey) : metric.value}
                  {metric.unit && (
                    <span className={cn(
                      'ml-1 text-sm font-medium',
                      metric.primary ? 'text-[#b9eef0]' : 'text-[#9eb1bd]'
                    )}>
                      {metric.unit}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {outcome.working && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9eb1bd]">{t('calculationDetail')}</p>
              <p className="mt-1 font-mono text-sm">{outcome.working}</p>
            </div>
          )}

          {outcome.warnings && outcome.warnings.length > 0 && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-xs text-amber-200">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <ul className="list-disc space-y-1 pl-4 leading-5 text-amber-100/80">
                {outcome.warnings.map((warningKey) => <li key={warningKey}>{t(warningKey)}</li>)}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="mt-7 flex items-start gap-2 border-t border-white/10 pt-5">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#67e8f9]" />
        <p className="text-[11px] leading-5 text-[#9eb1bd]">{t('clinicalDecisionSupportDisclaimer')}</p>
      </div>
    </section>
  );
}
