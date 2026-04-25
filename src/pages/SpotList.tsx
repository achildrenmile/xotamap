/**
 * SpotList page — T26/T27/T28
 *
 * Shows live spots from the Spothole API with auto-refresh,
 * filterable and sortable table, and a refresh status bar.
 */

import { useMemo } from 'react';
import { useI18n } from '../i18n';
import { useSpotPoller } from '../hooks/useSpotPoller';
import { useSpotFilters } from '../hooks/useSpotFilters';
import { SpotTable } from '../components/Spots/SpotTable';
import { SpotFilters } from '../components/Spots/SpotFilters';

// Load programs at module level for filter options
import programsData from '../../public/data/programs/index.json';

const ALL_PROGRAM_CODES: string[] = (
  programsData.programs as Array<{ code: string }>
).map((p) => p.code);

export default function SpotList() {
  const { t } = useI18n();

  // T26 — auto-polling hook
  const { spots, loading, error, lastUpdate, secondsUntilRefresh, refresh } =
    useSpotPoller({
      needsSig: true,
      limit: 200,
    });

  // T28 — filter state
  const {
    filters,
    toggleProgram,
    setBand,
    setMode,
    setMaxAge,
    clearFilters,
    activeFilterCount,
    filterSpots,
  } = useSpotFilters();

  // Apply filters to the polled spots
  const filteredSpots = useMemo(() => filterSpots(spots), [filterSpots, spots]);

  // Format last-update time
  const lastUpdateText = lastUpdate
    ? lastUpdate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  const refreshText = t.refreshIn.replace('{seconds}', String(secondsUntilRefresh));

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Page header */}
      <div className="px-4 pt-4 pb-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{t.spotsTitle}</h1>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {/* Last update */}
            <span className="hidden sm:inline">{t.lastUpdate}: <span className="font-medium text-gray-700 dark:text-gray-300">{lastUpdateText}</span></span>

            {/* Refresh countdown */}
            <span className="hidden sm:inline">{refreshText}</span>

            {/* Manual refresh button */}
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              title={refreshText}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400
                hover:bg-blue-100 dark:hover:bg-blue-800/40 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? t.loading : refreshText}
            </button>
          </div>
        </div>

        {/* Spot count */}
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {filteredSpots.length} / {spots.length} spots
          {activeFilterCount > 0 && (
            <span className="ml-1">
              ({t.activeFilters.replace('{count}', String(activeFilterCount))})
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <SpotFilters
        filters={filters}
        availablePrograms={ALL_PROGRAM_CODES}
        activeFilterCount={activeFilterCount}
        onToggleProgram={toggleProgram}
        onSetBand={setBand}
        onSetMode={setMode}
        onSetMaxAge={setMaxAge}
        onClear={clearFilters}
      />

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
          {t.error}: {error}
        </div>
      )}

      {/* Spot table — scrollable */}
      <div className="flex-1 overflow-auto">
        <SpotTable spots={filteredSpots} loading={loading} />
      </div>
    </div>
  );
}
