import type { OverlapReference } from '../types/overlap';

/**
 * Module-level cache: each grid cell is fetched at most once per session.
 */
const gridCache = new Map<string, OverlapReference[]>();

/**
 * Computes the grid key for a given coordinate.
 * Grid size: 0.25° x 0.25°.
 */
export function getGridKey(lat: number, lon: number): string {
  return `${(Math.floor(lat * 4) / 4).toFixed(2)}_${(Math.floor(lon * 4) / 4).toFixed(2)}`;
}

/**
 * Fetches the overlap grid for a given coordinate.
 * Returns cached data if available; otherwise fetches from
 * `/data/overlaps/grid/{gridKey}.json`.
 * Returns an empty array if the file doesn't exist (404).
 */
export async function fetchOverlapGrid(
  lat: number,
  lon: number,
): Promise<OverlapReference[]> {
  const key = getGridKey(lat, lon);

  if (gridCache.has(key)) {
    return gridCache.get(key)!;
  }

  try {
    const response = await fetch(`/data/overlaps/grid/${key}.json`);
    if (!response.ok) {
      // 404 or any other error — treat as empty
      gridCache.set(key, []);
      return [];
    }
    const raw = await response.json();
    // Grid files are { references: [{ code, program, name, coordinates: [lon, lat] }] }
    const rawRefs: Array<{
      code: string;
      program: string;
      name: string;
      coordinates: [number, number];
      elevation?: number;
      points?: number;
    }> = raw.references ?? raw;
    const data: OverlapReference[] = Array.isArray(rawRefs)
      ? rawRefs.map((r) => ({
          code: r.code,
          program: r.program,
          name: r.name,
          lon: Array.isArray(r.coordinates) ? r.coordinates[0] : (r as unknown as OverlapReference).lon,
          lat: Array.isArray(r.coordinates) ? r.coordinates[1] : (r as unknown as OverlapReference).lat,
          elevation: r.elevation,
          points: r.points,
        }))
      : [];
    gridCache.set(key, data);
    return data;
  } catch {
    // Network error — cache empty to avoid re-fetching
    gridCache.set(key, []);
    return [];
  }
}

/**
 * Fetches overlap grids for the given coordinate and all 8 adjacent cells.
 * This handles edge cases where a reference is near a cell boundary.
 */
export async function fetchOverlapGridWithNeighbors(
  lat: number,
  lon: number,
): Promise<OverlapReference[]> {
  const step = 0.25;
  const baseLat = Math.floor(lat * 4) / 4;
  const baseLon = Math.floor(lon * 4) / 4;

  const offsets = [-step, 0, step];
  const promises: Promise<OverlapReference[]>[] = [];

  for (const dLat of offsets) {
    for (const dLon of offsets) {
      promises.push(fetchOverlapGrid(baseLat + dLat, baseLon + dLon));
    }
  }

  const results = await Promise.all(promises);
  // Deduplicate by reference code
  const seen = new Set<string>();
  const merged: OverlapReference[] = [];
  for (const refs of results) {
    for (const ref of refs) {
      const key = `${ref.program}:${ref.code}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(ref);
      }
    }
  }

  return merged;
}
