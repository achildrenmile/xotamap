/**
 * T39 — LocalStorageWarning
 *
 * Yellow warning banner shown when the user has more than 50 QSOs
 * without exporting. Encourages export to avoid data loss.
 */

import { useI18n } from '../../i18n';

interface LocalStorageWarningProps {
  qsoCount: number;
}

export function LocalStorageWarning({ qsoCount }: LocalStorageWarningProps) {
  const { t } = useI18n();

  if (qsoCount <= 50) return null;

  return (
    <div className="flex items-start gap-2 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
      {/* Warning icon */}
      <svg
        className="w-4 h-4 shrink-0 mt-0.5 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      <span>{t.localStorageWarning}</span>
    </div>
  );
}
