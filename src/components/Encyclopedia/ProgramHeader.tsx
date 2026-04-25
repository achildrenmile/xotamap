import { useI18n } from '../../i18n';
import type { Program } from '../../types/program';

interface ProgramHeaderProps {
  program: Program;
}

export default function ProgramHeader({ program }: ProgramHeaderProps) {
  const { language } = useI18n();

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
        {/* Code row */}
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {program.code}
          </h1>
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
