/**
 * T37 — ActivationHeader
 *
 * Shows current activation info, QSO count badge,
 * and "New Activation" / "End Activation" buttons.
 */

import type { Activation } from '../../types/qso';
import { useI18n } from '../../i18n';

interface ActivationHeaderProps {
  activation: Activation | null;
  qsoCount: number;
  onNewActivation: () => void;
  onEndActivation: () => void;
}

export function ActivationHeader({
  activation,
  qsoCount,
  onNewActivation,
  onEndActivation,
}: ActivationHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
      {/* Left: activation info */}
      <div className="flex items-center gap-3">
        {activation ? (
          <>
            {/* Active indicator */}
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              {t.activeActivation}
            </span>

            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{activation.location || activation.date}</span>
              {activation.references.length > 0 && (
                <span className="ml-2 text-gray-500 dark:text-gray-400 font-mono text-xs">
                  {activation.references.join(' · ')}
                </span>
              )}
            </div>

            {/* QSO count badge */}
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {t.qsoCount.replace('{count}', String(qsoCount))}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t.noActiveActivation}
          </span>
        )}
      </div>

      {/* Right: action buttons */}
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={onNewActivation}
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t.newActivation}
        </button>

        {activation && (
          <button
            type="button"
            onClick={onEndActivation}
            className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {t.endActivation}
          </button>
        )}
      </div>
    </div>
  );
}
