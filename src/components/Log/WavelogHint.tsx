/**
 * T39 — WavelogHint
 *
 * Info banner at the top of the log page pointing users to Wavelog
 * for permanent, cross-device logging.
 */

import { useI18n } from '../../i18n';

export function WavelogHint() {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
      {/* Info icon */}
      <svg
        className="w-4 h-4 shrink-0 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <span>
        {t.wavelogHint}{' '}
        <a
          href="https://wavelog.oeradio.at"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-100"
        >
          wavelog.oeradio.at
        </a>
      </span>
    </div>
  );
}
