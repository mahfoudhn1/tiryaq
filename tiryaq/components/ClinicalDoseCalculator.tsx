"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FlaskConical,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useMedicationSearch } from "@/hooks/useMedicationSearch";
import { useLocale } from "@/lib/i18n/useLocale";
import {
  calculateBsa,
  dosePatient,
  DOSING_RULES,
  type Patient,
  type DoseOutcome,
} from "@/lib/clinicalEngine";

import type { AlgerianMedication } from "@/lib/db";

type AgeUnit = "months" | "years";
type Formulation = "liquid" | "tablet";

export function ClinicalDoseCalculator() {
  const { language, t } = useLocale();
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [age, setAge] = useState("30");
  const [ageUnit, setAgeUnit] = useState<AgeUnit>("years");

  const [query, setQuery] = useState("");
  const [selectedMedication, setSelectedMedication] =
    useState<AlgerianMedication | null>(null);

  const [formulation, setFormulation] =
    useState<Formulation>("liquid");

  const {
    results,
    isLoading,
    error,
    executionTimeMs,
  } = useMedicationSearch(query);

  // ------------------------------------------------------------
  // Patient
  // ------------------------------------------------------------

  const weightKg = Number(weight);
  const heightCm = Number(height);

  const ageMonths =
    ageUnit === "years"
      ? Number(age) * 12
      : Number(age);

  const patient = useMemo<Patient>(
    () => ({
      age_months: ageMonths,
      weight_kg: weightKg,
      height_cm: heightCm,
    }),
    [ageMonths, weightKg, heightCm]
  );

  // ------------------------------------------------------------
  // Dosing outcome (rule lookup + calculation in one typed result)
  // ------------------------------------------------------------

  const outcome = useMemo<DoseOutcome | null>(() => {
    if (!selectedMedication) return null;
    if (weightKg <= 0 || !Number.isFinite(weightKg)) return null;
    if (!Number.isFinite(ageMonths) || ageMonths < 0) return null;

    try {
      return dosePatient(selectedMedication.dci, patient, DOSING_RULES);
    } catch {
      // Invalid patient input (e.g. NaN weight/age slipped through the guards above).
      return null;
    }
  }, [selectedMedication, patient, weightKg, ageMonths]);

  const rule = outcome?.ok ? outcome.rule : null;
  const dose = outcome?.ok ? outcome.result : null;
  const isAmbiguous = outcome?.ok === false && outcome.reason === "ambiguous_rules";

  // An ambiguous rule set is a data bug, not something to guess through for the
  // user. Surface it to developers loudly; the UI below treats it the same as
  // "no rule found" rather than picking one arbitrarily.
  useEffect(() => {
    if (isAmbiguous && selectedMedication) {
      // eslint-disable-next-line no-console
      console.error(
        `Ambiguous dosing rules for "${selectedMedication.dci}": multiple rules match this patient. Fix DOSING_RULES.`
      );
    }
  }, [isAmbiguous, selectedMedication]);

  // ------------------------------------------------------------
  // BSA
  // ------------------------------------------------------------

  const bsa =
    weightKg > 0 && heightCm > 0
      ? calculateBsa(heightCm, weightKg)
      : 0;

  // ------------------------------------------------------------
  // Selection
  // ------------------------------------------------------------

  const chooseMedication = (
    medication: AlgerianMedication
  ) => {
    setSelectedMedication(medication);
    setQuery(medication.brand_name || medication.dci);
  };

  const clearMedication = () => {
    setSelectedMedication(null);
    setQuery("");
  };

  const hasSafetyCap =
    dose?.capped_by_single_dose ||
    dose?.capped_by_daily_dose;

  const volumeAvailable =
    formulation === "liquid" &&
    dose?.volume_ml !== null &&
    dose?.volume_ml !== undefined;

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} lang={language} className="min-h-screen bg-[#FFFFFF] px-4 py-6 text-[#0F2A3D] dark:bg-[#0A1520] dark:text-[#EAF1F7] sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#0369A1]/15 pb-6 dark:border-[#1E2A38] lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#075985]">
              <FlaskConical size={14} />
              {t("clinicalWorkspace")}
            </div>

            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              {t("doseCalculator")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5B7184] dark:text-[#9FB0BF]">
              {t("clinicalCalculatorDescription")}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#0369A1]/25 bg-[#0369A1]/10 px-3 py-2 text-[11px] font-bold text-[#075985] dark:border-[#1E3A47] dark:bg-[#0B2436] dark:text-[#7DD3FC]">
            <Database size={15} />
            {t("localDatabaseOffline")}
          </div>
        </header>

        {/* ================================================== */}
        {/* MAIN */}
        {/* ================================================== */}

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">

          {/* ================================================= */}
          {/* PATIENT */}
          {/* ================================================= */}

          <section
            className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl dark:border-[#1E2A38] dark:bg-[#131F2E] sm:p-7"
            aria-labelledby="patient-heading"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0369A1] text-white">
                <UserRound size={18} />
              </div>

              <div>
                <h2
                  id="patient-heading"
                  className="font-bold"
                >
                  {t("patient")}
                </h2>

                <p className="text-xs text-[#5B7184] dark:text-[#9FB0BF]">
                  {t("enterPatientParameters")}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              {/* Weight */}

              <label className="text-xs font-bold text-[#5B7184] dark:text-[#EAF1F7]">
                {t("weight")}
                <div className="relative mt-2">
                  <input
                    value={weight}
                    onChange={(event) =>
                      setWeight(event.target.value)
                    }
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    className="w-full rounded-xl border border-[#0369A1]/15 bg-white px-3 py-3 pr-12 text-sm outline-none transition focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5B7184]">
                    {t("kilograms")}
                  </span>
                </div>
              </label>

              {/* Height */}

              <label className="text-xs font-bold text-[#5B7184] dark:text-[#EAF1F7]">
                {t("height")}
                <div className="relative mt-2">
                  <input
                    value={height}
                    onChange={(event) =>
                      setHeight(event.target.value)
                    }
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    className="w-full rounded-xl border border-[#0369A1]/15 bg-white px-3 py-3 pr-12 text-sm outline-none transition focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5B7184]">
                    {t("centimeters")}
                  </span>
                </div>
              </label>

              {/* Age */}

              <label className="text-xs font-bold text-[#5B7184] dark:text-[#EAF1F7]">
                {t("age")}
                <input
                  value={age}
                  onChange={(event) =>
                    setAge(event.target.value)
                  }
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-[#0369A1]/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20"
                />
              </label>

              {/* Age unit */}

              <label className="text-xs font-bold text-[#5B7184] dark:text-[#EAF1F7]">
                {t("ageUnit")}
                <select
                  value={ageUnit}
                  onChange={(event) =>
                    setAgeUnit(
                      event.target.value as AgeUnit
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#0369A1]/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20"
                >
                  <option value="years">{t("years")}</option>
                  <option value="months">{t("months")}</option>
                </select>
              </label>
            </div>

            {/* Patient summary */}

            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-[#0369A1]/10 p-3 dark:bg-[#0F1D2B]">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B7184]">
                  {t("bodySurfaceArea")}
                </p>

                <p className="mt-1 text-lg font-bold">
                  {bsa > 0
                    ? `${bsa.toFixed(2)} m²`
                    : "—"}
                </p>
              </div>

              <div className="rounded-xl bg-[#0369A1]/10 p-3 dark:bg-[#0F1D2B]">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5B7184]">
                  Age
                </p>

                <p className="mt-1 text-lg font-bold">
                  {Number.isFinite(ageMonths) &&
                  ageMonths >= 0
                    ? `${ageMonths} months`
                    : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* MEDICATION */}
          {/* ================================================= */}

          <section
            className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl dark:border-[#1E2A38] dark:bg-[#131F2E] sm:p-7"
            aria-labelledby="medication-heading"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="medication-heading"
                  className="font-bold"
                >
                  {t("medication")}
                </h2>

                <p className="mt-1 text-xs text-[#5B7184] dark:text-[#9FB0BF]">
                  {t("searchNomenclatureDescription")}
                </p>
              </div>

              {executionTimeMs !== null && (
                <span className="text-[10px] font-bold text-[#075985]">
                  {executionTimeMs.toFixed(2)} ms
                </span>
              )}
            </div>

            {/* Search */}

            <div className="relative mt-6">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7184]"
              />

              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedMedication(null);
                }}
                placeholder={t("searchBrandOrDci")}
                className="w-full rounded-xl border border-[#0369A1]/15 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20"
                aria-label="Search medications"
              />

              {query &&
                results.length > 0 &&
                !selectedMedication && (
                  <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-xl border border-[#0369A1]/15 bg-white/75 p-1 shadow-xl backdrop-blur-xl dark:border-[#1E2A38] dark:bg-[#131F2E]">
                    {results.map((medication) => (
                      <button
                        type="button"
                        key={medication.id}
                        onClick={() =>
                          chooseMedication(medication)
                        }
                        className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-[#0369A1]/10 dark:hover:bg-[#152A33]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold">
                            {medication.brand_name ||
                              medication.dci}
                          </span>

                          <span className="mt-1 block truncate text-[11px] text-[#5B7184] dark:text-[#9FB0BF]">
                            {medication.dci}
                            {" · "}
                            {medication.form}
                            {" · "}
                            {medication.dosage}
                          </span>
                        </span>

                        <span className="shrink-0 rounded-md bg-[#0369A1]/10 px-2 py-1 text-[9px] font-bold text-[#5B7184] dark:bg-[#0F1D2B] dark:text-[#9FB0BF]">
                          {medication.is_reimbursable
                            ? t("hop")
                            : t("off")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {isLoading && (
              <p className="mt-2 text-[11px] text-[#5B7184]">
                {t("searchingLocalNomenclature")}
              </p>
            )}

            {error && (
              <p className="mt-2 text-[11px] text-red-600">
                {error}
              </p>
            )}

            {/* Selected medication */}

            {selectedMedication ? (
              <div className="mt-5 rounded-xl border border-[#0369A1]/25 bg-[#0369A1]/10 p-4 dark:border-[#1E3A47] dark:bg-[#0B2436]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#075985]">
                      {t("selectedMedication")}
                    </p>

                    <p className="mt-1 truncate text-sm font-bold">
                      {selectedMedication.brand_name ||
                        selectedMedication.dci}
                    </p>

                    <p className="mt-1 text-xs text-[#5B7184] dark:text-[#9FB0BF]">
                      {selectedMedication.dci}
                      {" · "}
                      {selectedMedication.form}
                      {" · "}
                      {selectedMedication.dosage}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearMedication}
                    className="text-xs font-bold text-[#075985] hover:underline"
                  >
                    {t("change")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-[#0369A1]/15 p-4 text-xs text-[#5B7184] dark:border-[#1E2A38] dark:text-[#9FB0BF]">
                {t("searchToCalculate")}
              </div>
            )}

            {/* Formulation */}

            <div className="mt-5">
              <label className="text-xs font-bold text-[#5B7184] dark:text-[#EAF1F7]">
                {t("formulation")}

                <select
                  value={formulation}
                  onChange={(event) =>
                    setFormulation(
                      event.target.value as Formulation
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-[#0369A1]/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20"
                >
                  <option value="liquid">
                    {t("liquid")}
                  </option>

                  <option value="tablet">
                    {t("tablet")}
                  </option>
                </select>
              </label>
            </div>
          </section>
        </div>

        {/* ================================================== */}
        {/* RESULT */}
        {/* ================================================== */}

        <section
          className="mt-5 rounded-2xl bg-gradient-to-br from-[#0369A1] to-[#075985] p-5 text-white shadow-[0_20px_50px_rgba(18,50,71,0.18)] sm:p-7"
          aria-labelledby="result-heading"
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7DD3FC]">
                {t("calculation")}
              </p>

              <h2
                id="result-heading"
                className="mt-2 text-2xl font-bold"
              >
                {selectedMedication
                  ? `${selectedMedication.dci} ${t("doseCalculator")}`
                  : t("doseCalculation")}
              </h2>
            </div>

            {hasSafetyCap && (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-2 text-[11px] font-bold text-amber-300">
                <ShieldCheck size={15} />
                {t("safetyLimitApplied")}
              </span>
            )}
          </div>

          {/* No medication */}

          {!selectedMedication && (
            <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-[#DCEEFC]">
              {t("selectMedicationToCalculate")}
            </div>
          )}

          {/* Medication selected but no usable rule (includes the ambiguous-rule
              case: we never guess between overlapping rules, we just decline) */}

          {selectedMedication && !rule && (
            <div className="mt-7 flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-400/10 p-5 text-sm text-amber-200">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-bold">
                  {t("noDosingRule")}
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-100/80">
                  {t("noCompatibleRule")}
                </p>
              </div>
            </div>
          )}

          {/* Result */}

          {dose && (
            <>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {/* Single dose */}

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB0BF]">
                    {t("singleDose")}
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {dose.dose_mg.toFixed(0)}
                    <span className="ml-1 text-sm font-medium text-[#9FB0BF]">
                      {t("milligrams")}
                    </span>
                  </p>
                </div>

                {/* Liquid volume */}

                {volumeAvailable && (
                  <div className="rounded-xl bg-[#0369A1] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A9D8D0]">
                      {t("liquidVolume")}
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {dose.volume_ml!.toFixed(1)}
                      <span className="ml-1 text-sm font-medium text-[#A9D8D0]">
                        {t("milliliters")}
                      </span>
                    </p>
                  </div>
                )}

                {/* Daily dose */}

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB0BF]">
                    {t("dailyTotal")}
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {dose.daily_dose_mg.toFixed(0)}
                    <span className="ml-1 text-sm font-medium text-[#9FB0BF]">
                      {t("milligrams")}
                    </span>
                  </p>
                </div>

                {/* Interval */}

                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB0BF]">
                    {t("administration")}
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-lg font-bold">
                    <Clock3
                      size={18}
                      className="text-[#7DD3FC]"
                    />

                    {dose.interval_hours !== null
                      ? t("everyHours").replace("{hours}", dose.interval_hours.toFixed(0))
                      : t("seeRule")}
                  </p>
                </div>
              </div>

              {/* Safety cap banner (dose was reduced) */}

              {hasSafetyCap && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-xs text-amber-200">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="font-bold">
                    {t("doseLimitedBySafety")}
                  </p>
                </div>
              )}

              {/* All engine warnings — caps, extreme weight/age, hard-to-measure
                  volume, etc. Shown regardless of whether a cap was applied,
                  since several of these warnings never involve capping at all. */}

              {dose.warnings.length > 0 && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-xs text-amber-200">
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <ul className="list-disc space-y-1 pl-4 leading-5 text-amber-100/80">
                    {dose.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rule information */}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB0BF]">
                    {t("dosingMethod")}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {rule?.dose_mg_per_kg !== undefined
                      ? `${rule.dose_mg_per_kg} ${t("mgPerKg")}`
                      : rule?.fixed_dose_mg !== undefined
                        ? `${rule.fixed_dose_mg} ${t("fixedDose")}`
                        : t("unknownRule")}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9FB0BF]">
                    {t("ruleSource")}
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold">
                    {rule?.source || t("configuredClinicalRule")}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Disclaimer */}

          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="text-[11px] leading-5 text-[#9FB0BF]">
              {t("educationalDisclaimer")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}