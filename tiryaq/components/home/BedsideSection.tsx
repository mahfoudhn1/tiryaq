'use client';

import { useMemo, useState } from 'react';
import { Calculator, Check, Search, ShieldCheck } from 'lucide-react';
import type { Translate } from './shared';

interface Medicine {
  brandName: string;
  inn: string;
  strength?: string;
  form?: string;
}

export function BedsideSection({ t }: { t: Translate }) {
  const scores = t('homeBedsideScores').split('·').map((item) => item.trim());

  return (
    <section id="tools" className="bg-[#061019] text-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7DD3FC]">{t('homeBedsideLabel')}</p>
          <h2 className="home-display mt-4 text-4xl leading-[1.05] sm:text-5xl">{t('homeBedsideTitle')}</h2>
          <p className="mt-6 text-[15px] leading-7 text-[#9FB0BF]">{t('homeBedsideBody')}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {scores.map((score) => (
            <span
              key={score}
              className="rounded-full border border-[#9FC6EB]/20 bg-[#0B2436] px-3.5 py-1.5 text-[12px] font-semibold text-[#9FB0BF]"
            >
              {score}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <ScoreCard t={t} />
          <DoseSearch t={t} />
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#9FC6EB]/20 bg-[#0B2436] px-4 py-2 text-[12px] font-semibold text-[#7DD3FC]">
          <ShieldCheck size={15} />
          {t('homeBedsideOffline')}
        </div>
      </div>
    </section>
  );
}

function ScoreCard({ t }: { t: Translate }) {
  const [flags, setFlags] = useState({ chf: true, htn: true, dm: true, stroke: false, vascular: false, female: false });
  const [ageBand, setAgeBand] = useState(65);

  const score =
    Number(flags.chf) +
    Number(flags.htn) +
    Number(flags.dm) +
    Number(flags.stroke) * 2 +
    Number(flags.vascular) +
    Number(flags.female) +
    (ageBand === 75 ? 2 : ageBand === 65 ? 1 : 0);

  const interpretation =
    score >= 2 ? t('homeBedsideCalcResult') : score === 1 ? t('chaInterpretationModerate') : t('chaInterpretationLow');

  const toggles: { key: keyof typeof flags; label: Parameters<Translate>[0] }[] = [
    { key: 'chf', label: 'chaChf' },
    { key: 'htn', label: 'chaHypertension' },
    { key: 'dm', label: 'chaDiabetes' },
    { key: 'stroke', label: 'chaStroke' },
    { key: 'vascular', label: 'chaVascular' },
    { key: 'female', label: 'chaSex' },
  ];

  const ageOptions: { value: number; label: Parameters<Translate>[0] }[] = [
    { value: 0, label: 'chaAgeUnder65' },
    { value: 65, label: 'chaAge65to74' },
    { value: 75, label: 'chaAge75plus' },
  ];

  return (
    <div className="rounded-[28px] border border-[#9FC6EB]/20 bg-[#0B2436] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7DD3FC]">
            {t('homeBedsideCalcLabel')}
          </span>
          <h3 className="home-display mt-2 text-[24px] leading-none">{t('homeBedsideCalcTitle')}</h3>
          <p className="mt-3 text-[12px] text-[#9FB0BF]">{t('homeBedsideCalcMeta')}</p>
        </div>
        <Calculator size={20} className="text-[#7DD3FC]" />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {toggles.map((toggle) => {
          const active = flags[toggle.key];
          return (
            <button
              key={toggle.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFlags((current) => ({ ...current, [toggle.key]: !current[toggle.key] }))}
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-start text-[12px] font-medium transition-colors ${
                active
                  ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-white'
                  : 'border-[#9FC6EB]/20 bg-[#0F2E44] text-[#9FB0BF] hover:border-[#38BDF8]/60'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                  active ? 'border-[#38BDF8] bg-[#38BDF8] text-[#061019]' : 'border-[#7C93A6]'
                }`}
              >
                {active && <Check size={11} />}
              </span>
              <span className="flex-1 leading-5">{t(toggle.label)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7DD3FC]">{t('chaAge')}</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {ageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={ageBand === option.value}
              onClick={() => setAgeBand(option.value)}
              className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors ${
                ageBand === option.value
                  ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-white'
                  : 'border-[#9FC6EB]/20 bg-[#0F2E44] text-[#9FB0BF] hover:border-[#38BDF8]/60'
              }`}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-[#9FC6EB]/20 pt-5">
        <span className="home-display block text-[30px] leading-none text-[#7DD3FC]">
          {t('homeBedsideCalcScore').replace('4', String(score))}
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-6 text-[#DCEAF5]">{interpretation}</p>
      <p className="mt-3 text-[11px] leading-5 text-[#7C93A6]">{t('homeBedsideCalcCaveat')}</p>
    </div>
  );
}

function DoseSearch({ t }: { t: Translate }) {
  const [all, setAll] = useState<Medicine[] | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!all || term.length < 2) return [];
    return all
      .filter((medicine) => medicine.inn?.toLowerCase().includes(term) || medicine.brandName?.toLowerCase().includes(term))
      .slice(0, 5);
  }, [all, query]);

  const handleChange = (value: string) => {
    setQuery(value);
    if (!all && value.trim().length >= 2) {
      setLoading(true);
      fetch('/data/algerian_nomenclature.json')
        .then((response) => response.json())
        .then((data: { medicines?: Medicine[] }) => setAll(data.medicines ?? []))
        .catch(() => setAll([]))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="flex flex-col rounded-[28px] border border-[#9FC6EB]/20 bg-[#0B2436] p-5 sm:p-7">
      <h3 className="home-display text-[24px] leading-tight">{t('homeBedsideDoseTitle')}</h3>
      <p className="mt-3 text-[13px] leading-6 text-[#9FB0BF]">{t('homeBedsideDoseText')}</p>

      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-[#9FC6EB]/25 bg-[#0F2E44] px-4 py-3">
        <Search size={16} className="shrink-0 text-[#7DD3FC]" />
        <input
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={t('searchBrandOrDci')}
          className="w-full bg-transparent text-[13px] text-white placeholder:text-[#7C93A6] focus:outline-none"
        />
      </label>

      <div className="mt-4 min-h-[120px] flex-1">
        {loading && <p className="text-[12px] text-[#7C93A6]">{t('searchingLocalNomenclature')}</p>}
        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-[12px] text-[#7C93A6]">{t('homeBedsideDoseNoResults')}</p>
        )}
        <ul className="space-y-2">
          {results.map((medicine) => (
            <li
              key={`${medicine.brandName}-${medicine.strength ?? ''}-${medicine.form ?? ''}`}
              className="rounded-xl border border-[#9FC6EB]/15 bg-[#0F2E44] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-bold text-white">{medicine.brandName}</span>
                {medicine.strength && (
                  <span className="rounded-full bg-[#38BDF8]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#7DD3FC]">
                    {medicine.strength}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#9FB0BF]">{medicine.inn}</p>
              {medicine.form && <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7C93A6]">{medicine.form}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
