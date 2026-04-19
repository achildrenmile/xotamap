import { useState, useCallback } from 'react';
import type maplibregl from 'maplibre-gl';
import { useI18n } from '../../i18n';
import { useGeolocation } from '../../hooks/useGeolocation';
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

interface WhatCountsHereProps {
  map: maplibregl.Map | null;
}

/**
 * Standalone "What counts here?" panel/drawer.
 * Users can type coordinates or use GPS to find programs at a location.
 */
export function WhatCountsHere({ map }: WhatCountsHereProps) {
  const { t } = useI18n();
  const { position, loading: gpsLoading, locate } = useGeolocation();

  const [open, setOpen] = useState(false);
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [matches, setMatches] = useState<ProgramMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchedPoint, setSearchedPoint] = useState<{ lat: number; lon: number } | null>(null);

  const handleSearch = useCallback(
    async (lat: number, lon: number) => {
      setLoading(true);
      setSearched(true);
      setSearchedPoint({ lat, lon });
      setMatches([]);
      try {
        const results = await findProgramsAtLocation(lat, lon);
        setMatches(results);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const lat = parseFloat(latInput);
      const lon = parseFloat(lonInput);
      if (isNaN(lat) || isNaN(lon)) return;
      handleSearch(lat, lon);
    },
    [latInput, lonInput, handleSearch],
  );

  const handleUseGps = useCallback(() => {
    if (position) {
      setLatInput(position.lat.toFixed(5));
      setLonInput(position.lng.toFixed(5));
      handleSearch(position.lat, position.lng);
    } else {
      locate();
    }
  }, [position, locate, handleSearch]);

  // When GPS position arrives and panel is open, auto-fill
  const handleGpsArrived = useCallback(() => {
    if (position && open) {
      setLatInput(position.lat.toFixed(5));
      setLonInput(position.lng.toFixed(5));
      handleSearch(position.lat, position.lng);
    }
  }, [position, open, handleSearch]);

  // Auto-search when GPS position arrives
  if (position && open && !searched && latInput === '' && lonInput === '') {
    handleGpsArrived();
  }

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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white/95 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        title={t.whatCountsHere}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {t.whatCountsHere}
      </button>
    );
  }

  return (
    <div className="pointer-events-auto w-72 max-h-[60vh] flex flex-col rounded-xl border border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t.whatCountsHere}
        </span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setSearched(false);
            setMatches([]);
            setLatInput('');
            setLonInput('');
            setSearchedPoint(null);
          }}
          className="p-1 rounded text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
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

      {/* Coordinate input */}
      <form onSubmit={handleSubmit} className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Lat"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Latitude"
          />
          <input
            type="text"
            placeholder="Lon"
            value={lonInput}
            onChange={(e) => setLonInput(e.target.value)}
            className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Longitude"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {t.search}
          </button>
          <button
            type="button"
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
          >
            {gpsLoading ? t.loading : t.useMyLocation}
          </button>
        </div>
      </form>

      {/* Hint when not searched yet */}
      {!searched && !loading && (
        <div className="py-4 px-3 text-center text-xs text-gray-400 dark:text-gray-500">
          {t.enterCoordinates}
          <br />
          <span className="text-[10px]">{t.rightClickHint}</span>
        </div>
      )}

      {/* Results */}
      {(searched || loading) && (
        <div className="overflow-y-auto flex-1 py-1">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-500 dark:text-gray-400">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"
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
              <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {t.noPrograms}
              </div>
              {searchedPoint && (
                <NearbyReferences
                  lat={searchedPoint.lat}
                  lon={searchedPoint.lon}
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
                  className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  title={t.flyToReference}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0 mt-0.5 border border-white/30 shadow-sm"
                    style={{ backgroundColor: PROGRAM_COLORS[match.program] || '#888' }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {match.reference}
                      </span>
                      <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 flex-shrink-0">
                        {match.programCode}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {match.name}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
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
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
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
              {searchedPoint && (
                <NearbyReferences
                  lat={searchedPoint.lat}
                  lon={searchedPoint.lon}
                  matchedPrograms={matches.map((m) => m.program)}
                  map={map}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
