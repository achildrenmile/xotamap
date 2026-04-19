import { useState, useEffect } from 'react';
import type maplibregl from 'maplibre-gl';
import { distance } from '@turf/distance';
import { point } from '@turf/helpers';
import { useI18n } from '../../i18n';
import { fetchOverlapGridWithNeighbors } from '../../services/overlap';

/** Program colors — mirrors programs/index.json */
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

interface NearbyRef {
  program: string;
  programCode: string;
  reference: string;
  name: string;
  distanceKm: number;
  lat: number;
  lon: number;
}

interface NearbyReferencesProps {
  lat: number;
  lon: number;
  /** Programs already matched at this location — we skip these */
  matchedPrograms: string[];
  map: maplibregl.Map | null;
}

/**
 * T33 — For programs that have no match at the current location,
 * shows the single nearest reference per program (up to 5 programs).
 */
export function NearbyReferences({ lat, lon, matchedPrograms, map }: NearbyReferencesProps) {
  const { t } = useI18n();
  const [nearbyRefs, setNearbyRefs] = useState<NearbyRef[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNearbyRefs([]);

    // Fetch a wider search area — use 3x3 grid neighbours already
    // but extend to 2 rings to find distant program references.
    // We reuse fetchOverlapGridWithNeighbors which covers ±0.25° (~28 km).
    fetchOverlapGridWithNeighbors(lat, lon)
      .then((references) => {
        if (cancelled) return;

        const userPoint = point([lon, lat]);
        const matchedSet = new Set(matchedPrograms);

        // Group by program, keeping only unmatched programs
        const byProgram = new Map<string, { ref: typeof references[0]; dist: number }>();

        for (const ref of references) {
          if (matchedSet.has(ref.program)) continue;

          const refPoint = point([ref.lon, ref.lat]);
          const dist = distance(userPoint, refPoint, { units: 'kilometers' });

          const existing = byProgram.get(ref.program);
          if (!existing || dist < existing.dist) {
            byProgram.set(ref.program, { ref, dist });
          }
        }

        // Convert to array, sort by distance, limit to 5 programs
        const results: NearbyRef[] = Array.from(byProgram.entries())
          .map(([program, { ref, dist }]) => ({
            program,
            programCode: program.toUpperCase(),
            reference: ref.code,
            name: ref.name,
            distanceKm: Math.round(dist * 10) / 10,
            lat: ref.lat,
            lon: ref.lon,
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 5);

        setNearbyRefs(results);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setNearbyRefs([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, matchedPrograms]);

  const handleFlyTo = (ref: NearbyRef) => {
    if (!map) return;
    map.flyTo({
      center: [ref.lon, ref.lat],
      zoom: Math.max(map.getZoom(), 12),
    });
  };

  if (loading) return null;
  if (nearbyRefs.length === 0) return null;

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {t.nearestReferences}
      </div>
      {nearbyRefs.map((ref) => (
        <button
          key={`nearby-${ref.program}-${ref.reference}`}
          type="button"
          onClick={() => handleFlyTo(ref)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          title={t.flyToReference}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/30 shadow-sm opacity-70"
            style={{ backgroundColor: PROGRAM_COLORS[ref.program] || '#888' }}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">
                {ref.reference}
              </span>
              <span className="text-[10px] px-1 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 flex-shrink-0">
                {ref.programCode}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
              {t.distance.replace('{km}', String(ref.distanceKm))} — {ref.name}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
