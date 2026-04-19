import { useState, useCallback } from 'react';
import type maplibregl from 'maplibre-gl';
import type { BasemapStyle } from './mapStyles';
import { getBasemapStyle } from './mapStyles';
import { useI18n } from '../../i18n';

interface BasemapOption {
  id: BasemapStyle;
  labelKey: 'basemapStandard' | 'basemapOutdoor' | 'basemapDark';
  icon: string;
}

const BASEMAP_OPTIONS: BasemapOption[] = [
  { id: 'standard', labelKey: 'basemapStandard', icon: '🗺️' },
  { id: 'outdoor', labelKey: 'basemapOutdoor', icon: '🏕️' },
  { id: 'dark', labelKey: 'basemapDark', icon: '🌙' },
];

interface BasemapSelectorProps {
  map: maplibregl.Map;
  /** Currently active basemap style. When darkMode changes, parent may override. */
  activeStyle: BasemapStyle;
  onStyleChange: (style: BasemapStyle) => void;
}

/**
 * Small floating control to switch between basemap styles.
 * Preserves current map center, zoom, bearing, and pitch when switching.
 */
export function BasemapSelector({
  map,
  activeStyle,
  onStyleChange,
}: BasemapSelectorProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleSelect = useCallback(
    async (style: BasemapStyle) => {
      if (style === activeStyle || switching) return;
      setOpen(false);
      setSwitching(true);

      try {
        const newStyle = await getBasemapStyle(style);
        // Capture current view state
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bearing = map.getBearing();
        const pitch = map.getPitch();

        map.setStyle(newStyle as Parameters<typeof map.setStyle>[0]);

        // Restore view state after style loads
        map.once('styledata', () => {
          map.jumpTo({ center, zoom, bearing, pitch });
          setSwitching(false);
        });

        onStyleChange(style);
      } catch {
        setSwitching(false);
      }
    },
    [map, activeStyle, switching, onStyleChange],
  );

  const activeOption = BASEMAP_OPTIONS.find((o) => o.id === activeStyle);

  return (
    <div className="pointer-events-auto relative">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={switching}
        title={t.basemap}
        aria-label={t.basemap}
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white/95 shadow-md backdrop-blur-sm text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors ${switching ? 'opacity-60 cursor-wait' : ''}`}
      >
        <span aria-hidden="true">{activeOption?.icon ?? '🗺️'}</span>
        <span className="hidden sm:inline">{t.basemap}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full mb-2 left-0 min-w-[9rem] rounded-xl border border-gray-200 bg-white/98 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/98 overflow-hidden z-10">
          {BASEMAP_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors
                ${
                  activeStyle === option.id
                    ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
            >
              <span aria-hidden="true">{option.icon}</span>
              <span>{t[option.labelKey]}</span>
              {activeStyle === option.id && (
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
                  className="ml-auto"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
