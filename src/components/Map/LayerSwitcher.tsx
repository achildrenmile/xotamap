import { useState } from 'react';
import { useI18n } from '../../i18n';

export interface ProgramEntry {
  code: string;
  name: string;
  color: string;
  tier: number;
  hasReferences: boolean;
}

interface LayerSwitcherProps {
  programs: ProgramEntry[];
  visibility: Record<string, boolean>;
  onToggle: (code: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const TIER_COLORS: Record<number, string> = {
  1: 'text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  2: 'text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  3: 'text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  4: 'text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

/**
 * Sidebar panel with checkboxes to toggle reference layers per program.
 * Collapses on mobile via a toggle button.
 */
export function LayerSwitcher({
  programs,
  visibility,
  onToggle,
  onShowAll,
  onHideAll,
}: LayerSwitcherProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);

  // Group programs by tier, only include those with references
  const withRefs = programs.filter((p) => p.hasReferences);
  const tiers = [1, 2, 3, 4];

  return (
    <div className="pointer-events-auto flex flex-col rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 w-56 max-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t.layerSwitcher}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-2 p-1 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          aria-label={open ? t.hideAllLayers : t.showAllLayers}
          aria-expanded={open}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <>
          {/* All-on / All-off buttons */}
          <div className="flex gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <button
              type="button"
              onClick={onShowAll}
              className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {t.showAllLayers}
            </button>
            <button
              type="button"
              onClick={onHideAll}
              className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {t.hideAllLayers}
            </button>
          </div>

          {/* Program list grouped by tier */}
          <div className="overflow-y-auto flex-1 py-1">
            {tiers.map((tier) => {
              const tierPrograms = withRefs.filter((p) => p.tier === tier);
              if (tierPrograms.length === 0) return null;
              const tierLabel =
                tier === 1
                  ? t.tier1
                  : tier === 2
                    ? t.tier2
                    : tier === 3
                      ? t.tier3
                      : t.tier4;
              return (
                <div key={tier} className="mb-1">
                  <div className="px-3 py-1">
                    <span className={`px-1.5 py-0.5 rounded ${TIER_COLORS[tier]}`}>
                      {tierLabel}
                    </span>
                  </div>
                  {tierPrograms.map((program) => (
                    <label
                      key={program.code}
                      className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      {/* Color dot */}
                      <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0 border border-white/30 shadow-sm"
                        style={{ backgroundColor: program.color }}
                        aria-hidden="true"
                      />
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={visibility[program.code] ?? false}
                        onChange={() => onToggle(program.code)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                      />
                      {/* Program code */}
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate leading-tight">
                        {program.code}
                      </span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
