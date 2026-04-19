import { distance } from '@turf/distance';
import { point } from '@turf/helpers';
import { fetchOverlapGridWithNeighbors } from './overlap';

export interface ProgramRules {
  minQsos?: number;
  activationRadius?: string;
}

export interface ProgramMatch {
  program: string;      // "sota"
  programCode: string;  // "SOTA"
  reference: string;    // "OE/TI-001"
  name: string;         // "Großglockner"
  distance: number;     // meters from user location
  lat: number;
  lon: number;
  elevation?: number;
  points?: number;
  rules?: ProgramRules;
}

/** Cached program rules loaded from /data/programs/index.json */
let programRulesCache: Map<string, ProgramRules> | null = null;

async function loadProgramRules(): Promise<Map<string, ProgramRules>> {
  if (programRulesCache) return programRulesCache;
  try {
    const resp = await fetch('/data/programs/index.json');
    if (!resp.ok) {
      programRulesCache = new Map();
      return programRulesCache;
    }
    const data = await resp.json();
    const map = new Map<string, ProgramRules>();
    for (const p of data.programs ?? []) {
      if (p.code && p.rules) {
        map.set((p.code as string).toLowerCase(), {
          minQsos: p.rules.minQsos,
          activationRadius: p.rules.activationRadius,
        });
      }
    }
    programRulesCache = map;
    return map;
  } catch {
    programRulesCache = new Map();
    return programRulesCache;
  }
}

/**
 * Finds all programs/references near a given location.
 *
 * @param lat - Latitude of the query point
 * @param lon - Longitude of the query point
 * @param maxDistance - Maximum distance in meters (default: 5000m / 5km)
 * @returns Array of matching programs sorted by distance (nearest first)
 */
export async function findProgramsAtLocation(
  lat: number,
  lon: number,
  maxDistance: number = 5000,
): Promise<ProgramMatch[]> {
  const [references, rulesMap] = await Promise.all([
    fetchOverlapGridWithNeighbors(lat, lon),
    loadProgramRules(),
  ]);
  const userPoint = point([lon, lat]);

  const matches: ProgramMatch[] = [];

  for (const ref of references) {
    const refPoint = point([ref.lon, ref.lat]);
    const dist = distance(userPoint, refPoint, { units: 'meters' });

    if (dist <= maxDistance) {
      matches.push({
        program: ref.program,
        programCode: ref.program.toUpperCase(),
        reference: ref.code,
        name: ref.name,
        distance: Math.round(dist),
        lat: ref.lat,
        lon: ref.lon,
        elevation: ref.elevation,
        points: ref.points,
        rules: rulesMap.get(ref.program),
      });
    }
  }

  // Sort by distance, nearest first
  matches.sort((a, b) => a.distance - b.distance);

  return matches;
}
