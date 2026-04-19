/**
 * T28 — Spot Filter State
 *
 * Manages UI filter state for the spot list/map.
 * Persists selections to localStorage.
 * Exposes a `filterSpots` function that applies all active filters to a spot array.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Spot } from '../types/spot';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BandOption =
  | '160m'
  | '80m'
  | '40m'
  | '30m'
  | '20m'
  | '17m'
  | '15m'
  | '12m'
  | '10m'
  | '6m'
  | '2m'
  | '70cm';

export type ModeOption =
  | 'SSB'
  | 'CW'
  | 'FM'
  | 'FT8'
  | 'FT4'
  | 'AM'
  | 'RTTY'
  | 'Other';

/** null = show all */
export type MaxAgeOption = 5 | 15 | 30 | 60 | null;

export interface SpotFilterState {
  programs: string[];   // empty = all
  band: BandOption | '';
  mode: ModeOption | '';
  maxAge: MaxAgeOption;
}

export interface UseSpotFiltersResult {
  filters: SpotFilterState;
  setPrograms: (programs: string[]) => void;
  toggleProgram: (program: string) => void;
  setBand: (band: BandOption | '') => void;
  setMode: (mode: ModeOption | '') => void;
  setMaxAge: (age: MaxAgeOption) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  filterSpots: (spots: Spot[]) => Spot[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ALL_BANDS: BandOption[] = [
  '160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '2m', '70cm',
];

export const ALL_MODES: ModeOption[] = [
  'SSB', 'CW', 'FM', 'FT8', 'FT4', 'AM', 'RTTY', 'Other',
];

const DEFAULT_FILTERS: SpotFilterState = {
  programs: [],
  band: '',
  mode: '',
  maxAge: null,
};

const STORAGE_KEY = 'xotamap-spot-filters';

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadFilters(): SpotFilterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    return { ...DEFAULT_FILTERS, ...(JSON.parse(raw) as Partial<SpotFilterState>) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function saveFilters(f: SpotFilterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  } catch {
    // Ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSpotFilters(): UseSpotFiltersResult {
  const [filters, setFilters] = useState<SpotFilterState>(loadFilters);

  // Persist whenever filters change
  useEffect(() => {
    saveFilters(filters);
  }, [filters]);

  const setPrograms = useCallback((programs: string[]) => {
    setFilters((f) => ({ ...f, programs }));
  }, []);

  const toggleProgram = useCallback((program: string) => {
    setFilters((f) => {
      const next = f.programs.includes(program)
        ? f.programs.filter((p) => p !== program)
        : [...f.programs, program];
      return { ...f, programs: next };
    });
  }, []);

  const setBand = useCallback((band: BandOption | '') => {
    setFilters((f) => ({ ...f, band }));
  }, []);

  const setMode = useCallback((mode: ModeOption | '') => {
    setFilters((f) => ({ ...f, mode }));
  }, []);

  const setMaxAge = useCallback((maxAge: MaxAgeOption) => {
    setFilters((f) => ({ ...f, maxAge }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.programs.length > 0) count++;
    if (filters.band !== '') count++;
    if (filters.mode !== '') count++;
    if (filters.maxAge !== null) count++;
    return count;
  }, [filters]);

  const filterSpots = useCallback(
    (spots: Spot[]): Spot[] => {
      const nowSec = Date.now() / 1000;
      return spots.filter((spot) => {
        // Program filter
        if (filters.programs.length > 0 && !filters.programs.includes(spot.programCode)) {
          return false;
        }
        // Band filter
        if (filters.band !== '' && spot.band.toLowerCase() !== filters.band.toLowerCase()) {
          return false;
        }
        // Mode filter
        if (filters.mode !== '') {
          const spotMode = spot.mode.toUpperCase();
          const filterMode = filters.mode.toUpperCase();
          if (filterMode === 'OTHER') {
            // Match anything not in the explicit list
            const knownModes: string[] = ['SSB', 'CW', 'FM', 'FT8', 'FT4', 'AM', 'RTTY'];
            if (knownModes.includes(spotMode)) return false;
          } else {
            if (spotMode !== filterMode) return false;
          }
        }
        // Max age filter (maxAge is in minutes, timeUnix is seconds)
        if (filters.maxAge !== null) {
          const ageSec = nowSec - spot.timeUnix;
          if (ageSec > filters.maxAge * 60) return false;
        }
        return true;
      });
    },
    [filters],
  );

  return {
    filters,
    setPrograms,
    toggleProgram,
    setBand,
    setMode,
    setMaxAge,
    clearFilters,
    activeFilterCount,
    filterSpots,
  };
}
