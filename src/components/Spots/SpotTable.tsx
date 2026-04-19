/**
 * T27 — SpotTable
 *
 * Sortable table of spots. Shows as a full table on desktop,
 * and as stacked cards on mobile.
 */

import { useState, useMemo } from 'react';
import type { Spot } from '../../types/spot';
import { SpotRow } from './SpotRow';
import { useI18n } from '../../i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'callsign' | 'frequency' | 'mode' | 'reference' | 'programCode' | 'timeUnix';
type SortDir = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortSpots(spots: Spot[], key: SortKey, dir: SortDir): Spot[] {
  return [...spots].sort((a, b) => {
    let aVal: string | number = a[key] ?? '';
    let bVal: string | number = b[key] ?? '';

    // Numeric sort for frequency and time
    if (key === 'frequency' || key === 'timeUnix') {
      aVal = Number(aVal);
      bVal = Number(bVal);
      return dir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }

    // String sort
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();
    if (aVal < bVal) return dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SpotTableProps {
  spots: Spot[];
  loading?: boolean;
}

export function SpotTable({ spots, loading = false }: SpotTableProps) {
  const { t } = useI18n();
  const [sortKey, setSortKey] = useState<SortKey>('timeUnix');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'timeUnix' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => sortSpots(spots, sortKey, sortDir), [spots, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return <span className="ml-1 text-gray-300 dark:text-gray-600">↕</span>;
    return <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const headerClass =
    'px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap';

  // Empty state
  if (!loading && spots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        <p className="text-sm">{t.noSpots}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/60 sticky top-0 z-10">
            <tr>
              <th className={headerClass} onClick={() => handleSort('callsign')}>
                {t.callsign}<SortIcon col="callsign" />
              </th>
              <th className={headerClass} onClick={() => handleSort('frequency')}>
                {t.frequency}<SortIcon col="frequency" />
              </th>
              <th className={headerClass} onClick={() => handleSort('mode')}>
                {t.mode}<SortIcon col="mode" />
              </th>
              <th className={headerClass} onClick={() => handleSort('reference')}>
                {t.reference}<SortIcon col="reference" />
              </th>
              <th className={headerClass} onClick={() => handleSort('programCode')}>
                {t.program}<SortIcon col="programCode" />
              </th>
              <th className={headerClass} onClick={() => handleSort('timeUnix')}>
                {t.age}<SortIcon col="timeUnix" />
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t.comment}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {sorted.map((spot) => (
              <SpotRow key={spot.id} spot={spot} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden pb-4">
        {sorted.map((spot) => (
          <SpotRow key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  );
}
