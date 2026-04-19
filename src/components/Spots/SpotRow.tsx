/**
 * T27 — SpotRow
 *
 * A single row in the spot table (desktop) or a card (mobile).
 * Handles age display, new-spot highlighting, and external links.
 */

import type { Spot } from '../../types/spot';
import { useI18n } from '../../i18n';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format frequency in Hz → human-readable kHz/MHz string */
function formatFrequency(hz: number): string {
  if (hz >= 1_000_000) {
    return (hz / 1_000_000).toFixed(3) + ' MHz';
  }
  return (hz / 1_000).toFixed(1) + ' kHz';
}

/** Build QRZ lookup URL for a callsign */
function qrzUrl(callsign: string): string {
  return `https://www.qrz.com/db/${encodeURIComponent(callsign)}`;
}

/** Age display values */
function useAgeDisplay(timeUnix: number, t: ReturnType<typeof useI18n>['t']) {
  const nowSec = Date.now() / 1000;
  const ageSec = nowSec - timeUnix;
  const ageMin = ageSec / 60;

  let text: string;
  if (ageSec < 30) {
    text = t.justNow;
  } else if (ageMin < 60) {
    text = t.minutesAgo.replace('{n}', String(Math.floor(ageMin)));
  } else {
    text = t.hoursAgo.replace('{n}', String(Math.floor(ageMin / 60)));
  }

  const isNew = ageMin < 2;
  return { text, isNew };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SpotRowProps {
  spot: Spot;
}

export function SpotRow({ spot }: SpotRowProps) {
  const { t } = useI18n();
  const { text: ageText, isNew } = useAgeDisplay(spot.timeUnix, t);

  const rowClass = `
    border-b border-gray-200 dark:border-gray-700 transition-colors
    ${isNew ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
  `;

  return (
    <>
      {/* Desktop table row */}
      <tr className={`hidden md:table-row ${rowClass}`}>
        {/* Callsign */}
        <td className="px-3 py-2 text-sm font-mono font-semibold whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {isNew && (
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" title={t.newSpot} />
            )}
            <a
              href={qrzUrl(spot.callsign)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {spot.callsign}
            </a>
          </div>
        </td>

        {/* Frequency */}
        <td className="px-3 py-2 text-sm font-mono whitespace-nowrap text-gray-700 dark:text-gray-300">
          {formatFrequency(spot.frequency)}
        </td>

        {/* Mode */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <span className="inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {spot.mode || '—'}
          </span>
        </td>

        {/* Reference */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          {spot.reference ? (
            spot.referenceUrl ? (
              <a
                href={spot.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-mono"
              >
                {spot.reference}
              </a>
            ) : (
              <span className="font-mono text-gray-700 dark:text-gray-300">{spot.reference}</span>
            )
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>

        {/* Program */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <span className="text-gray-600 dark:text-gray-400 font-medium">{spot.programCode || spot.program || '—'}</span>
        </td>

        {/* Age */}
        <td className="px-3 py-2 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400" title={spot.time}>
          {ageText}
        </td>

        {/* Comment */}
        <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
          {spot.comment || ''}
        </td>
      </tr>

      {/* Mobile card */}
      <div className={`md:hidden p-3 mx-2 my-1.5 rounded-lg border border-gray-200 dark:border-gray-700 ${isNew ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-gray-800'}`}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            {isNew && (
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            <a
              href={qrzUrl(spot.callsign)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {spot.callsign}
            </a>
            {isNew && (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                {t.newSpot}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500" title={spot.time}>{ageText}</span>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
          <span className="font-mono text-gray-700 dark:text-gray-300">{formatFrequency(spot.frequency)}</span>
          <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {spot.mode || '—'}
          </span>
          <span className="text-gray-500 dark:text-gray-400 font-medium">{spot.programCode || spot.program || '—'}</span>
          {spot.reference && (
            spot.referenceUrl ? (
              <a
                href={spot.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
              >
                {spot.reference}
              </a>
            ) : (
              <span className="font-mono text-gray-700 dark:text-gray-300">{spot.reference}</span>
            )
          )}
        </div>

        {/* Comment */}
        {spot.comment && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{spot.comment}</p>
        )}
      </div>
    </>
  );
}
