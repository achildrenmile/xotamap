import { useI18n } from '../../i18n';

interface ProgramFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  tier: number | null;
  onTierChange: (tier: number | null) => void;
}

export default function ProgramFilter({
  search,
  onSearchChange,
  tier,
  onTierChange,
}: ProgramFilterProps) {
  const { t } = useI18n();

  const tiers: Array<{ value: number | null; label: string }> = [
    { value: null, label: t.allTiers },
    { value: 1, label: t.tier1 },
    { value: 2, label: t.tier2 },
    { value: 3, label: t.tier3 },
    { value: 4, label: t.tier4 },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPrograms}
          aria-label={t.searchPrograms}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Tier filter */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:inline">
          {t.filterByTier}:
        </span>
        <div className="flex gap-1 flex-wrap">
          {tiers.map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onTierChange(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                tier === value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-pressed={tier === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
