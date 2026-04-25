import { useState, useEffect, useCallback, useRef } from 'react';
import type maplibregl from 'maplibre-gl';
import { useI18n } from '../../i18n';
import { findProgramsAtLocation, type ProgramMatch } from '../../services/multiProgram';
import { NearbyReferences } from './NearbyReferences';

/** Known program colors — mirrors programs/index.json */
const PROGRAM_COLORS: Record<string, string> = {
  sota: '#E74C3C',
  pota: '#27AE60',
  wwff: '#2ECC71',
  gma: '#8B4513',
  iota: '#3498DB',
  wca: '#9B59B6',
  wwbota: '#7F8C8D',
  bota: '#F39C12',
  hema: '#A0522D',
  wlota: '#F1C40F',
  illw: '#E67E22',
  tota: '#1ABC9C',
  llota: '#2980B9',
  'cota-oe': '#8E44AD',
  wota: '#6B8E23',
  slota: '#16A085',
};

interface OverlapFinderProps {
  map: maplibregl.Map;
  /** Optional external trigger: when this changes, open panel at that location */
  externalPoint?: { lat: number; lon: number } | null;
}

interface SelectedPoint {
  lat: number;
  lon: number;
}

/**
 * "What counts here?" panel triggered by right-click (desktop) or long-press (mobile).
 * Also accepts an externalPoint prop to programmatically open the panel (e.g. from LocationSearch).
 * Queries the overlap grid for all programs/references near the selected point.
 */
export function OverlapFinder({ map, externalPoint }: OverlapFinderProps) {
  const { t } = useI18n();
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [matches, setMatches] = useState<ProgramMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStart = useRef<{ x: number; y: number } | null>(null);

  // Handle right-click (contextmenu) on map
  const handleContextMenu = useCallback((e: maplibregl.MapMouseEvent) => {
    e.preventDefault();
    const { lat, lng } = e.lngLat;
    setSelectedPoint({ lat, lon: lng });
    setVisible(true);
  }, []);

  // Handle long-press on mobile
  const handleTouchStart = useCallback((e: maplibregl.MapTouchEvent) => {
    if (e.originalEvent.touches.length !== 1) return;
    const touch = e.originalEvent.touches[0];
    longPressStart.current = { x: touch.clientX, y: touch.clientY };
    longPressTimer.current = setTimeout(() => {
      const { lat, lng } = e.lngLat;
      setSelectedPoint({ lat, lon: lng });
      setVisible(true);
    }, 600);
  }, []);

  const handleTouchMove = useCallback((e: maplibregl.MapTouchEvent) => {
    if (!longPressStart.current || !longPressTimer.current) return;
    const touch = e.originalEvent.touches[0];
    const dx = touch.clientX - longPressStart.current.x;
    const dy = touch.clientY - longPressStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      longPressStart.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressStart.current = null;
  }, []);

  // Attach/detach map event listeners
  useEffect(() => {
    if (!map) return;

    map.on('contextmenu', handleContextMenu);
    map.on('touchstart', handleTouchStart);
    map.on('touchmove', handleTouchMove);
    map.on('touchend', handleTouchEnd);

    return () => {
      map.off('contextmenu', handleContextMenu);
      map.off('touchstart', handleTouchStart);
      map.off('touchmove', handleTouchMove);
      map.off('touchend', handleTouchEnd);
    };
  }, [map, handleContextMenu, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Respond to external point trigger (e.g. from LocationSearch)
  useEffect(() => {
    if (!externalPoint) return;
    setSelectedPoint({ lat: externalPoint.lat, lon: externalPoint.lon });
    setVisible(true);
  }, [externalPoint]);

  // Fetch programs when selectedPoint changes
  useEffect(() => {
    if (!selectedPoint) return;

    let cancelled = false;
    setLoading(true);
    setMatches([]);

    findProgramsAtLocation(selectedPoint.lat, selectedPoint.lon)
      .then((results) => {
        if (!cancelled) {
          setMatches(results);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMatches([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPoint]);

  const handleFlyTo = useCallback(
    (match: ProgramMatch) => {
      if (!map) return;
      map.flyTo({
        center: [match.lon, match.lat],
        zoom: Math.max(map.getZoom(), 14),
      });
    },
    [map],
  );

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setSelectedPoint(null);
    setMatches([]);
  }, []);

  if (!visible || !selectedPoint) return null;

  return (
    <div className="pointer-events-auto absolute bottom-8 right-2 z-20 w-72 max-h-[60vh] flex flex-col rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800">
          {t.whatCountsHere}
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded text-gray-500 hover:text-gray-800 transition-colors"
          aria-label={t.close}
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
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Coordinates */}
      <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100 flex-shrink-0">
        {t.coordinates}: {selectedPoint.lat.toFixed(5)}, {selectedPoint.lon.toFixed(5)}
      </div>

      {/* Results */}
      <div className="overflow-y-auto flex-1 py-1">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-sm text-gray-500">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t.searchingPrograms}
          </div>
        ) : matches.length === 0 ? (
          <>
            <div className="py-4 text-center text-sm text-gray-500">
              {t.noPrograms}
            </div>
            {selectedPoint && (
              <NearbyReferences
                lat={selectedPoint.lat}
                lon={selectedPoint.lon}
                matchedPrograms={[]}
                map={map}
              />
            )}
          </>
        ) : (
          <>
            {matches.map((match, idx) => (
              <button
                key={`${match.program}-${match.reference}-${idx}`}
                type="button"
                onClick={() => handleFlyTo(match)}
                className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                title={t.flyToReference}
              >
                {/* Program color dot */}
                <span
                  className="inline-block w-3 h-3 rounded-full flex-shrink-0 mt-0.5 border border-white/30 shadow-sm"
                  style={{ backgroundColor: PROGRAM_COLORS[match.program] || '#888' }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-800 truncate">
                      {match.reference}
                    </span>
                    <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-gray-100 text-gray-600 flex-shrink-0">
                      {match.programCode}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {match.name}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {t.metersAway.replace('{m}', String(match.distance))}
                    {match.elevation != null && (
                      <span className="ml-2">
                        {t.elevation}: {match.elevation}m
                      </span>
                    )}
                    {match.points != null && (
                      <span className="ml-2">
                        {t.points}: {match.points}
                      </span>
                    )}
                  </div>
                  {/* T32 — rules summary */}
                  {match.rules && (match.rules.minQsos != null || match.rules.activationRadius) && (
                    <div className="text-[10px] text-gray-400 mt-0.5 flex flex-wrap gap-x-2">
                      {match.rules.minQsos != null && (
                        <span>{t.minQsosShort}: {match.rules.minQsos}</span>
                      )}
                      {match.rules.activationRadius && (
                        <span className="truncate" title={match.rules.activationRadius}>
                          {t.activationRadiusShort}: {match.rules.activationRadius}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
            {/* T33 — nearby references for programs not matched */}
            {selectedPoint && (
              <NearbyReferences
                lat={selectedPoint.lat}
                lon={selectedPoint.lon}
                matchedPrograms={matches.map((m) => m.program)}
                map={map}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
