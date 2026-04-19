import { useState, useRef, useCallback, useEffect } from 'react';
import type maplibregl from 'maplibre-gl';
import { useI18n } from '../../i18n';
import { searchLocation, type GeocodingResult } from '../../services/geocode';

const DEBOUNCE_MS = 300;

interface LocationSearchProps {
  map: maplibregl.Map | null;
  /** Called after the map flies to the chosen location */
  onLocationSelected?: (lat: number, lon: number) => void;
}

/**
 * T34 — Location search input with autocomplete dropdown.
 * Uses Nominatim (OpenStreetMap) geocoding.
 */
export function LocationSearch({ map, onLocationSelected }: LocationSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await searchLocation(q);
      setResults(res);
      setOpen(res.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!val.trim()) {
        setResults([]);
        setOpen(false);
        setSearching(false);
        return;
      }

      setSearching(true);
      debounceTimer.current = setTimeout(() => {
        doSearch(val);
      }, DEBOUNCE_MS);
    },
    [doSearch],
  );

  const handleSelect = useCallback(
    (result: GeocodingResult) => {
      setQuery(result.displayName);
      setOpen(false);
      setResults([]);

      if (map) {
        map.flyTo({
          center: [result.lon, result.lat],
          zoom: 13,
        });
      }

      onLocationSelected?.(result.lat, result.lon);
    },
    [map, onLocationSelected],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setOpen(false);
    setSearching(false);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    [],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-auto relative w-64">
      {/* Input row */}
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 bg-white/95 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
        {/* Search icon */}
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
          className="flex-shrink-0 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={t.searchLocationPlaceholder}
          className="flex-1 bg-transparent text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none min-w-0"
          aria-label={t.searchLocation}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {/* Spinner / clear button */}
        {searching ? (
          <svg
            className="animate-spin h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label={t.clearSearch}
          >
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
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white/98 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/98 overflow-hidden z-50">
          {results.map((result, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <div className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">
                {result.displayName}
              </div>
              {result.type && (
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                  {result.type}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
