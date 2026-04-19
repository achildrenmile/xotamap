/**
 * T28 — SpotFilters
 *
 * Filter controls for the spot list and map.
 * Programs: multi-select checkboxes
 * Band: dropdown
 * Mode: dropdown
 * Max age: dropdown
 * Shows active filter count badge and clear-all button.
 */

import { useState } from 'react';
import { useI18n } from '../../i18n';
import type {
  SpotFilterState,
  BandOption,
  ModeOption,
  MaxAgeOption,
} from '../../hooks/useSpotFilters';
import { ALL_BANDS, ALL_MODES } from '../../hooks/useSpotFilters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SpotFiltersProps {
  filters: SpotFilterState;
  availablePrograms: string[];
  activeFilterCount: number;
  onToggleProgram: (program: string) => void;
  onSetBand: (band: BandOption | '') => void;
  onSetMode: (mode: ModeOption | '') => void;
  onSetMaxAge: (age: MaxAgeOption) => void;
  onClear: () => void;
}

// ---------------------------------------------------------------------------
// Max-age options
// ---------------------------------------------------------------------------

const MAX_AGE_OPTIONS: Array<{ value: MaxAgeOption; labelKey: 'allAges' | 'maxAge5min' | 'maxAge15min' | 'maxAge30min' | 'maxAge1h' }> = [
  { value: null, labelKey: 'allAges' },
  { value: 5, labelKey: 'maxAge5min' },
  { value: 15, labelKey: 'maxAge15min' },
  { value: 30, labelKey: 'maxAge30min' },
  { value: 60, labelKey: 'maxAge1h' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SpotFilters({
  filters,
  availablePrograms,
  activeFilterCount,
  onToggleProgram,
  onSetBand,
  onSetMode,
  onSetMaxAge,
  onClear,
}: SpotFiltersProps) {
  const { t } = useI18n();
  const [programsOpen, setProgramsOpen] = useState(false);

  const selectClass =
    'w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer';

  const labelClass = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1';

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex flex-wrap items-end gap-4">
        {/* Programs multi-select */}
        <div className="relative min-w-[160px]">
          <span className={labelClass}>{t.filterPrograms}</span>
          <button
            type="button"
            onClick={() => setProgramsOpen((o) => !o)}
            className={`${selectClass} text-left flex items-center justify-between`}
          >
            <span>
              {filters.programs.length === 0
                ? <span className="text-gray-400 dark:text-gray-500">{t.allAges.replace('Any', 'All')}</span>
                : filters.programs.join(', ')}
            </span>
            <svg className="w-4 h-4 ml-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {programsOpen && (
            <div className="absolute z-50 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {availablePrograms.map((prog) => (
                <label
                  key={prog}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.programs.includes(prog)}
                    onChange={() => onToggleProgram(prog)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{prog}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Band dropdown */}
        <div className="min-w-[110px]">
          <span className={labelClass}>{t.filterBand}</span>
          <select
            value={filters.band}
            onChange={(e) => onSetBand(e.target.value as BandOption | '')}
            className={selectClass}
          >
            <option value="">{t.allBands}</option>
            {ALL_BANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Mode dropdown */}
        <div className="min-w-[110px]">
          <span className={labelClass}>{t.filterMode}</span>
          <select
            value={filters.mode}
            onChange={(e) => onSetMode(e.target.value as ModeOption | '')}
            className={selectClass}
          >
            <option value="">{t.allModes}</option>
            {ALL_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Max age dropdown */}
        <div className="min-w-[110px]">
          <span className={labelClass}>{t.filterMaxAge}</span>
          <select
            value={filters.maxAge ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              onSetMaxAge(v === '' ? null : (Number(v) as MaxAgeOption));
            }}
            className={selectClass}
          >
            {MAX_AGE_OPTIONS.map(({ value, labelKey }) => (
              <option key={String(value)} value={value ?? ''}>
                {t[labelKey]}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter count + clear button */}
        <div className="flex items-end gap-2 pb-0.5">
          {activeFilterCount > 0 && (
            <>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {t.activeFilters.replace('{count}', String(activeFilterCount))}
              </span>
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-red-500 dark:text-red-400 hover:underline"
              >
                {t.clearFilters}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Close programs dropdown when clicking outside */}
      {programsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProgramsOpen(false)}
        />
      )}
    </div>
  );
}
