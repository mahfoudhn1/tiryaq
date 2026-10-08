'use client';

import { useEffect, useState } from 'react';
import { initializeNomenclature, nomenclatureDb, type AlgerianMedication } from '@/lib/db';

interface MedicationSearchState {
  results: AlgerianMedication[];
  isLoading: boolean;
  error: string | null;
  executionTimeMs: number | null;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toUpperCase();
}

export function useMedicationSearch(query: string): MedicationSearchState {
  const [state, setState] = useState<MedicationSearchState>({ results: [], isLoading: true, error: null, executionTimeMs: null });

  useEffect(() => {
    let cancelled = false;
    const search = async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      try {
        await initializeNomenclature();
        const startedAt = performance.now();
        const normalizedQuery = normalizeSearchText(query);
        const results = normalizedQuery
          ? await nomenclatureDb.medications
              .filter((medication) => {
                const brandName = normalizeSearchText(medication.brand_name);
                const dci = normalizeSearchText(medication.dci);
                return brandName.includes(normalizedQuery) || dci.includes(normalizedQuery);
              })
              .toArray()
          : [];
        results.sort((left, right) => {
          const leftBrand = normalizeSearchText(left.brand_name);
          const leftDci = normalizeSearchText(left.dci);
          const rightBrand = normalizeSearchText(right.brand_name);
          const rightDci = normalizeSearchText(right.dci);
          const leftRank = leftBrand === normalizedQuery || leftDci === normalizedQuery ? 0 : leftBrand.startsWith(normalizedQuery) || leftDci.startsWith(normalizedQuery) ? 1 : 2;
          const rightRank = rightBrand === normalizedQuery || rightDci === normalizedQuery ? 0 : rightBrand.startsWith(normalizedQuery) || rightDci.startsWith(normalizedQuery) ? 1 : 2;
          return leftRank - rightRank || left.brand_name.localeCompare(right.brand_name);
        });
        const limitedResults = results.slice(0, 20);
        const executionTimeMs = performance.now() - startedAt;
        if (!cancelled) setState({ results: limitedResults, isLoading: false, error: null, executionTimeMs });
      } catch (error) {
        if (!cancelled) setState({ results: [], isLoading: false, executionTimeMs: null, error: error instanceof Error ? error.message : 'Local search failed' });
      }
    };
    void search();
    return () => { cancelled = true; };
  }, [query]);

  return state;
}