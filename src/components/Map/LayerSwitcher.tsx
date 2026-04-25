import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

export interface ProgramEntry {
  id: string;
  code: string;
  name: string;
  color: string;
  hasReferences: boolean;
}

interface LayerSwitcherProps {
  programs: ProgramEntry[];
  visibility: Record<string, boolean>;
  onToggle: (code: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

/**
 * Sidebar panel with checkboxes to toggle reference layers per program.
 * Always uses light styling since the map basemap is always light.
 * Starts collapsed on mobile (< 640px) to avoid blocking the map.
 */
export function LayerSwitcher({
  programs,
  visibility,
  onToggle,
  onShowAll,
  onHideAll,
}: LayerSwitcherProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(() => window.innerWidth >= 640);

  const withRefs = programs.filter((p) => p.hasReferences);
  const withoutRefs = programs.filter((p) => !p.hasReferences);

  return (
    <div className="pointer-events-auto flex flex-col rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm w-44 sm:w-56 max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-8rem)] overflow-hidden" style={{ colorScheme: 'light' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800">
          {t.layerSwitcher}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-2 p-1 rounded text-gray-500 hover:text-gray-800 transition-colors"
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
          <div className="flex gap-1 px-3 py-2 border-b border-gray-100 flex-shrink-0">
            <button
              type="button"
              onClick={onShowAll}
              className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              {t.showAllLayers}
            </button>
            <button
              type="button"
              onClick={onHideAll}
              className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              {t.hideAllLayers}
            </button>
          </div>

          {/* Program list */}
          <div className="overflow-y-auto flex-1 py-1">
            {withRefs.map((program) => (
              <label
                key={program.code}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full flex-shrink-0 border border-white/30 shadow-sm"
                  style={{ backgroundColor: program.color }}
                  aria-hidden="true"
                />
                <input
                  type="checkbox"
                  checked={visibility[program.code] ?? false}
                  onChange={() => onToggle(program.code)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <span className="text-xs text-gray-700 truncate leading-tight">
                  {program.code}
                </span>
              </label>
            ))}

            {withoutRefs.length > 0 && (
              <>
                <div className="px-3 pt-2 pb-1 border-t border-gray-100 mt-1">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                    {t.noMapData}
                  </span>
                </div>
                {withoutRefs.map((program) => (
                  <Link
                    key={program.code}
                    to={`/encyclopedia/${program.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0 border border-white/30 shadow-sm opacity-50"
                      style={{ backgroundColor: program.color }}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-gray-400 truncate leading-tight">
                      {program.code}
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Link to encyclopedia */}
          <div className="px-3 py-2 border-t border-gray-100 flex-shrink-0">
            <Link
              to="/encyclopedia"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {t.moreInfo} →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
