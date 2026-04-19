import { useI18n } from '../../i18n';
import type { Program } from '../../types/program';

interface ProgramHeaderProps {
  program: Program;
}

const TIER_COLORS: Record<number, string> = {
  1: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
  2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
  3: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-700',
  4: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
};

export default function ProgramHeader({ program }: ProgramHeaderProps) {
  const { t, language } = useI18n();

  const tierKey = `tier${program.tier}` as 'tier1' | 'tier2' | 'tier3' | 'tier4';
  const tierLabel = t[tierKey];
  const tierBadgeClass = TIER_COLORS[program.tier] ?? TIER_COLORS[4];

  const focusText = language === 'de' ? program.focusDE : program.focus;

  return (
    <div className="flex items-start gap-5">
      {/* Large colored program icon */}
      <div
        className="w-14 h-14 rounded-2xl flex-shrink-0 shadow-md flex items-center justify-center text-white font-bold text-xl"
        style={{ backgroundColor: program.color }}
        aria-hidden="true"
      >
        {program.code.substring(0, 2)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Code + tier badge row */}
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {program.code}
          </h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tierBadgeClass}`}>
            {tierLabel}
          </span>
          {program.region && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
              {program.region}
            </span>
          )}
        </div>

        {/* Full program name */}
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
          {program.name}
        </p>

        {/* Focus description */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {focusText}
        </p>
      </div>
    </div>
  );
}
