import { useI18n } from '../../i18n';
import type { Award } from '../../types/program';

interface AwardsListProps {
  awards: Award[];
}

export default function AwardsList({ awards }: AwardsListProps) {
  const { t } = useI18n();

  if (!awards || awards.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {t.awardsTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {awards.map((award, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-start gap-3"
          >
            {/* Trophy icon */}
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.5 3h7M7 3C5.343 3 4 4.343 4 6c0 2.21 1.79 4 4 4m0 0c.552 1.105 1.79 2 3 2s2.448-.895 3-2m-6 0H8c-2.21 0-4-1.79-4-4m12 0c1.657 0 3 1.343 3 3 0 2.21-1.79 4-4 4m0 0c-.552 1.105-1.79 2-3 2m6-6h-1M12 12v3m0 0l-2 2m2-2l2 2M12 15a3 3 0 0 0-3 3v1h6v-1a3 3 0 0 0-3-3z"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                {award.name}
              </p>
              {award.points != null && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  {award.points.toLocaleString()} {t.points}
                </p>
              )}
              {award.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {award.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
