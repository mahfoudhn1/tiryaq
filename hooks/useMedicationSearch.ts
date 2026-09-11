'use client';

import { useEffect, useState } from 'react';
import { initializeNomenclature, nomenclatureDb, type AlgerianMedication } from '@/lib/db';

interface MedicationSearchState {
  results: AlgerianMedication[];
  isLoading: boolean;
  error: string | null;
  executionTimeMs: number | null;
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
        const normalizedQuery = query.trim().toLocaleUpperCase();
        const results = normalizedQuery
          ? await nomenclatureDb.medications.filter((medication) => medication.brand_name.toLocaleUpperCase().includes(normalizedQuery) || medication.dci.toLocaleUpperCase().includes(normalizedQuery)).limit(20).toArray()
          : [];
        const executionTimeMs = performance.now() - startedAt;
        if (!cancelled) setState({ results, isLoading: false, error: null, executionTimeMs });
      } catch (error) {
        if (!cancelled) setState({ results: [], isLoading: false, executionTimeMs: null, error: error instanceof Error ? error.message : 'Local search failed' });
      }
    };
    void search();
    return () => { cancelled = true; };
  }, [query]);

  return state;
}