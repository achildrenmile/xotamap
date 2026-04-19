import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import type { Program } from '../../types/program';

interface ProgramCardProps {
  program: Program;
}

const TIER_COLORS: Record<number, string> = {
  1: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  3: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  4: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function ProgramCard({ program }: ProgramCardProps) {
  const { t, language } = useI18n();

  const tierKey = `tier${program.tier}` as 'tier1' | 'tier2' | 'tier3' | 'tier4';
  const tierLabel = t[tierKey];
  const tierBadgeClass = TIER_COLORS[program.tier] ?? TIER_COLORS[4];

  const focusText = language === 'de' ? program.focusDE : program.focus;

  return (
    <Link
      to={`/encyclopedia/${program.id}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`${program.code} — ${program.name}`}
    >
      {/* Header row: colored dot + code + tier badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Colored program dot */}
          <span
            className="inline-block w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
            style={{ backgroundColor: program.color }}
            aria-hidden="true"
          />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {program.code}
          </span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierBadgeClass}`}>
          {tierLabel}
        </span>
      </div>

      {/* Program full name */}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 line-clamp-2">
        {program.name}
      </p>

      {/* Focus description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {focusText}
      </p>

      {/* Footer: reference count */}
      {program.hasReferences && program.referenceCount != null && (
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {t.references}
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {program.referenceCount.toLocaleString()}
          </span>
        </div>
      )}
    </Link>
  );
}
