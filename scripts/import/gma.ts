/**
 * GMA (Global Mountain Activity) reference data importer.
 *
 * Strategy:
 *   GMA provides reference data via its map interface at cqgma.org.
 *   The GMA map uses GeoJSON data which can be fetched from the map tiles/API.
 *   We attempt to fetch the summit database via known endpoints.
 *
 * Source: https://www.cqgma.org
 */

import type { ImportResult, ReferenceFeature } from './types.js';
import {
  fetchWithRetry,
  createFeature,
  createFeatureCollection,
  createRateLimiter,
  isValidCoordinate,
  parseNumber,
  logSection,
  formatCount,
} from './utils.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

// Known GMA data endpoints (the map loads data from these)
const GMA_ENDPOINTS = [
  'https://www.cqgma.org/gmamap/data/summits.json',
  'https://www.cqgma.org/gmamap/data/gma_summits.geojson',
  'https://www.cqgma.org/api/summits/',
];

interface GmaSummit {
  reference?: string;
  ref?: string;
  code?: string;
  name?: string;
  summitName?: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lon?: number;
  lng?: number;
  altitude?: number;
  height?: number;
  elevation?: number;
  points?: number;
  region?: string;
  association?: string;
  lastActivation?: string;
}

function extractSummitData(raw: GmaSummit): {
  code: string;
  name: string;
  lat: number;
  lon: number;
  elevation?: number;
  points?: number;
  region?: string;
} | null {
  const code = raw.reference ?? raw.ref ?? raw.code;
  const name = raw.name ?? raw.summitName ?? '';
  const lat = raw.latitude ?? raw.lat;
  const lon = raw.longitude ?? raw.lon ?? raw.lng;

  if (!code || lat === undefined || lon === undefined) return null;

  return {
    code,
    name,
    lat,
    lon,
    elevation: parseNumber(raw.altitude ?? raw.height ?? raw.elevation),
    points: parseNumber(raw.points),
    region: raw.region ?? raw.association,
  };
}

export async function importGma(): Promise<ImportResult> {
  logSection('GMA — Global Mountain Activity');
  const result: ImportResult = { program: 'gma', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(2000);

  let rawData: GmaSummit[] | null = null;

  // Try known endpoints until one works
  for (const endpoint of GMA_ENDPOINTS) {
    await rateLimit();
    try {
      console.log(`  Trying endpoint: ${endpoint}`);
      const res = await fetchWithRetry(endpoint, {}, 1, 3000);
      const data = await res.json();

      // Handle both array and GeoJSON responses
      if (Array.isArray(data)) {
        rawData = data as GmaSummit[];
        console.log(`  Success: got ${formatCount(rawData.length)} records from array`);
        break;
      } else if (data?.type === 'FeatureCollection' && Array.isArray(data.features)) {
        rawData = data.features.map((f: { properties?: GmaSummit; geometry?: { coordinates?: number[] } }) => ({
          ...f.properties,
          longitude: f.geometry?.coordinates?.[0],
          latitude: f.geometry?.coordinates?.[1],
        })) as GmaSummit[];
        console.log(`  Success: got ${formatCount(rawData.length)} features from GeoJSON`);
        break;
      } else if (typeof data === 'object' && data.summits) {
        rawData = data.summits as GmaSummit[];
        console.log(`  Success: got ${formatCount(rawData.length)} summits from object`);
        break;
      }
    } catch (err) {
      console.warn(`  Endpoint failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (!rawData) {
    const msg = 'No GMA data endpoint returned valid data. GMA import skipped.';
    console.warn(`  WARNING: ${msg}`);
    result.errors.push(msg);
    // Write empty collection
    writeFileSync(join(OUTPUT_DIR, 'gma.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Process summits
  for (const raw of rawData) {
    const summit = extractSummitData(raw);
    if (!summit) {
      result.skipped++;
      continue;
    }

    if (!isValidCoordinate(summit.lon, summit.lat)) {
      result.skipped++;
      continue;
    }

    features.push(
      createFeature(summit.lon, summit.lat, {
        code: summit.code,
        program: 'gma',
        name: summit.name,
        elevation: summit.elevation,
        points: summit.points,
        region: summit.region,
      })
    );
  }

  // Write GeoJSON
  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'gma.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} GMA summits to ${outputPath}`);

  return result;
}
