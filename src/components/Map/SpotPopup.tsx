/**
 * T29 — SpotPopup
 *
 * Popup shown when clicking a spot marker on the map.
 * Rendered into a MapLibre Popup's DOM node via createRoot.
 *
 * Because the popup DOM node is outside the React provider tree,
 * we wrap with I18nProvider so translations are available.
 */

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import type { Spot } from '../../types/spot';
import { I18nProvider, useI18n } from '../../i18n';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFrequency(hz: number): string {
  if (hz >= 1_000_000) return (hz / 1_000_000).toFixed(3) + ' MHz';
  return (hz / 1_000).toFixed(1) + ' kHz';
}

function qrzUrl(callsign: string): string {
  return `https://www.qrz.com/db/${encodeURIComponent(callsign)}`;
}

function ageText(timeUnix: number): string {
  const ageSec = Date.now() / 1000 - timeUnix;
  const ageMin = ageSec / 60;
  if (ageSec < 30) return 'just now';
  if (ageMin < 60) return `${Math.floor(ageMin)}m ago`;
  return `${Math.floor(ageMin / 60)}h ago`;
}

// ---------------------------------------------------------------------------
// Popup content component (uses i18n via provider wrapper)
// ---------------------------------------------------------------------------

function SpotPopupContent({ spot }: { spot: Spot }) {
  const { t } = useI18n();

  return (
    <div className="min-w-[200px] max-w-[280px] font-sans text-sm">
      {/* Callsign header */}
      <div className="flex items-center gap-2 mb-2">
        <a
          href={qrzUrl(spot.callsign)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-mono font-bold text-blue-600 hover:underline"
        >
          {spot.callsign}
        </a>
        <span className="text-xs text-gray-500 ml-auto">{ageText(spot.timeUnix)}</span>
      </div>

      {/* Details grid */}
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-gray-500 font-medium">{t.frequency}</dt>
        <dd className="font-mono">{formatFrequency(spot.frequency)}</dd>

        <dt className="text-gray-500 font-medium">{t.mode}</dt>
        <dd>{spot.mode || '—'}</dd>

        {spot.reference && (
          <>
            <dt className="text-gray-500 font-medium">{t.reference}</dt>
            <dd>
              {spot.referenceUrl ? (
                <a
                  href={spot.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-mono"
                >
                  {spot.reference}
                </a>
              ) : (
                <span className="font-mono">{spot.reference}</span>
              )}
            </dd>
          </>
        )}

        <dt className="text-gray-500 font-medium">{t.program}</dt>
        <dd className="font-medium">{spot.programCode || spot.program || '—'}</dd>

        {spot.comment && (
          <>
            <dt className="text-gray-500 font-medium">{t.comment}</dt>
            <dd className="break-words">{spot.comment}</dd>
          </>
        )}
      </dl>

      {/* QRZ link */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <a
          href={qrzUrl(spot.callsign)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          {t.viewOnQrz} ↗
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hook: manages a MapLibre popup for a spot
// ---------------------------------------------------------------------------

interface UseSpotPopupOptions {
  map: maplibregl.Map;
  spot: Spot | null;
  onClose: () => void;
}

/**
 * Manages a single MapLibre popup for the currently selected spot.
 * Renders SpotPopupContent into the popup's DOM node via createRoot,
 * wrapping with I18nProvider so translations are available.
 */
export function useSpotPopup({ map, spot, onClose }: UseSpotPopupOptions) {
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!spot || spot.lat === undefined || spot.lon === undefined) {
      // Close existing popup
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      return;
    }

    // Create container div for React content
    const container = document.createElement('div');

    // Create or reuse popup
    if (!popupRef.current) {
      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
      });
      popupRef.current.on('close', () => onCloseRef.current());
    }

    popupRef.current
      .setLngLat([spot.lon, spot.lat])
      .setDOMContent(container)
      .addTo(map);

    // Render React content into the popup, with I18nProvider for translations
    if (rootRef.current) {
      rootRef.current.unmount();
    }
    rootRef.current = createRoot(container);
    rootRef.current.render(
      <I18nProvider>
        <SpotPopupContent spot={spot} />
      </I18nProvider>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, spot]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, []);
}
