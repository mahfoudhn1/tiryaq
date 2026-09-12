'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Download, Info, RotateCcw, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useLocale } from '@/lib/i18n/useLocale';
import { cn } from '@/lib/utils/cn';
import { getCalculatorResult, saveCalculatorResult } from '@/lib/calculators/resultStore';
import type { CalculatorDefinition } from '@/lib/calculators/types';

interface CalculatorViewProps {
  calculator: CalculatorDefinition;
}

export function CalculatorView({ calculator }: CalculatorViewProps) {
  const { language, t } = useLocale();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(calculator.fields.map((field) => [field.id, '']))
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const outcome = useMemo(() => calculator.calculate(values), [calculator, values]);

  const errors = outcome.ok ? {} : outcome.errors;
  const hasInput = calculator.fields.some((field) => values[field.id]?.trim() !== '');

  useEffect(() => {
    if (outcome.ok && outcome.data) {
      saveCalculatorResult(calculator.id, outcome.data);
    }
  }, [calculator.id, outcome]);

  const updateField = (id: string, value: string) => {
    setValues((previous) => ({ ...previous, [id]: value }));
  };

  const importValue = (fieldId: string) => {
    const config = calculator.imports?.[fieldId];
    if (!config) return;
    const source = getCalculatorResult(config.sourceCalculatorId);
    const value = source?.[config.sourceDataKey];
    if (value === undefined) return;

    setValues((previous) => ({ ...previous, [fieldId]: String(value) }));
    setTouched((previous) => ({ ...previous, [fieldId]: true }));
  };

  const reset = () => {
    setValues(Object.fromEntries(calculator.fields.map((field) => [field.id, ''])));
    setTouched({});
  };

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-screen bg-[#f4f8f8] px-4 py-6 text-[#0f172a] dark:bg-[#0d1b1f] dark:text-[#e2e8f0] sm:px-6 lg:px-10 lg:py-10"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 border-b border-[#dce7eb] pb-6 dark:border-[#304950]">
          <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0e7490]">
            <Activity size={14} />
            {t(calculator.categoryKey)}
          </div>

          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            {t(calculator.titleKey)}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b] dark:text-[#a9bbc1]">
            {t(calculator.descriptionKey)}
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Inputs */}
          <section
            className="rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-[#304950] dark:bg-[#172a30] sm:p-7"
            aria-labelledby="calculator-inputs-heading"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="calculator-inputs-heading" className="font-bold">
                  {t('calculatorInputs')}
                </h2>
                <p className="mt-1 text-xs text-[#64748b] dark:text-[#a9bbc1]">
                  {t('calculatorInputsDescription')}
                </p>
              </div>

              {hasInput && (
                <Button variant="ghost" size="sm" type="button" onClick={reset}>
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
                const importConfig = calculator.imports?.[field.id];
                const importedValue = importConfig
                  ? getCalculatorResult(importConfig.sourceCalculatorId)?.[importConfig.sourceDataKey]
                  : undefined;

                return (
                  <label
                    key={field.id}
                    className="text-xs font-bold text-[#334155] dark:text-[#d7e3e6]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{t(field.labelKey)}</span>

                      {importConfig && importedValue !== undefined && (
                        <button
                          type="button"
                          onClick={() => importValue(field.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[#b7e1e3] bg-[#e7fafa] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0e7490] transition-colors hover:border-[#0e7490] dark:border-[#285b63] dark:bg-[#16424a] dark:text-[#8ed7d7]"
                        >
                          <Download size={11} />
                          {t(importConfig.labelKey)} ({importedValue})
                        </button>
                      )}
                    </span>

                    {isSelect ? (
                      <select
                        id={fieldId}
                        value={values[field.id] ?? ''}
                        onChange={(event) => updateField(field.id, event.target.value)}
                        onBlur={() => setTouched((previous) => ({ ...previous, [field.id]: true }))}
                        aria-invalid={showError}
                        aria-describedby={showError ? errorId : undefined}
                        className={cn(
                          'mt-2 w-full rounded-xl border bg-transparent px-3 py-3 text-sm outline-none transition focus:ring-2',
                          showError
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-[#dce7eb] focus:border-[#0e7490] focus:ring-[#0e7490]/20'
                        )}
                      >
                        <option value="" disabled>
                          {t('selectOptionPlaceholder')}
                        </option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.value} —{' '}
                            {field.optionLabel ? field.optionLabel(language, option) : t(option.labelKey)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative mt-2">
                        <input
                          id={fieldId}
                          value={values[field.id] ?? ''}
                          onChange={(event) => updateField(field.id, event.target.value)}
                          onBlur={() => setTouched((previous) => ({ ...previous, [field.id]: true }))}
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

          {/* Formula */}
          <section
            className="rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-[#304950] dark:bg-[#172a30] sm:p-7"
            aria-labelledby="calculator-formula-heading"
          >
            <h2 id="calculator-formula-heading" className="font-bold">
              {t('formula')}
            </h2>

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
        </div>

        {/* Result */}
        <section
          className="mt-5 rounded-2xl bg-[#0f172a] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:p-7"
          aria-labelledby="calculator-result-heading"
          aria-live="polite"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#67e8f9]">
            {t('calculation')}
          </p>

          <h2 id="calculator-result-heading" className="mt-2 text-2xl font-bold">
            {t(calculator.titleKey)}
          </h2>

          {!outcome.ok ? (
            <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-[#b9c7d7]">
              {hasInput ? t('calculatorFixInputs') : t('calculatorEnterValues')}
            </div>
          ) : (
            <>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {outcome.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={cn('rounded-xl p-4', metric.primary ? 'bg-[#0e7490]' : 'bg-white/10')}
                  >
                    <p
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-[0.12em]',
                        metric.primary ? 'text-[#b9eef0]' : 'text-[#9eb1bd]'
                      )}
                    >
                      {t(metric.labelKey)}
                    </p>

                    <p className="mt-2 text-4xl font-bold">
                      {metric.value}
                      {metric.unit && (
                        <span
                          className={cn(
                            'ml-1 text-sm font-medium',
                            metric.primary ? 'text-[#b9eef0]' : 'text-[#9eb1bd]'
                          )}
                        >
                          {metric.unit}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {outcome.working && (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9eb1bd]">
                    {t('calculationDetail')}
                  </p>
                  <p className="mt-1 font-mono text-sm">{outcome.working}</p>
                </div>
              )}

              {outcome.warnings && outcome.warnings.length > 0 && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-xs text-amber-200">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <ul className="list-disc space-y-1 pl-4 leading-5 text-amber-100/80">
                    {outcome.warnings.map((warningKey) => (
                      <li key={warningKey}>{t(warningKey)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Disclaimer */}
          <div className="mt-7 flex items-start gap-2 border-t border-white/10 pt-5">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#67e8f9]" />
            <p className="text-[11px] leading-5 text-[#9eb1bd]">
              {t('clinicalDecisionSupportDisclaimer')}
            </p>
          </div>
        </section>

        {/* Clinical interpretation */}
        <section
          className="mt-5 rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-[#304950] dark:bg-[#172a30] sm:p-7"
          aria-labelledby="calculator-interpretation-heading"
        >
          <h2 id="calculator-interpretation-heading" className="font-bold">
            {t('clinicalInterpretation')}
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#64748b] dark:text-[#a9bbc1]">
            {t(outcome.ok && outcome.interpretationKey ? outcome.interpretationKey : calculator.interpretationKey)}
          </p>

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
      </div>
    </div>
  );
}
