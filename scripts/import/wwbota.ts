/**
 * WWBOTA (Worldwide Bunkers On The Air) reference data importer.
 *
 * Strategy:
 *   Fetch bunker data from the WWBOTA API.
 *   The API provides bunker references with coordinates.
 *
 * API: https://wwbota.net
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

// Known WWBOTA data endpoints
const WWBOTA_ENDPOINTS = [
  'https://api.wwbota.net/bunkers/',
  'https://wwbota.net/api/bunkers/',
  'https://wwbota.net/api/v1/bunkers/',
];

interface WwbotaBunker {
  reference?: string;
  ref?: string;
  code?: string;
  name?: string;
  bunkerName?: string;
  title?: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lon?: number;
  lng?: number;
  long?: number;
  country?: string;
  countryCode?: string;
  region?: string;
  status?: string;
  lastActivation?: string;
  activations?: number;
}

export async function importWwbota(): Promise<ImportResult> {
  logSection('WWBOTA — Worldwide Bunkers On The Air');
  const result: ImportResult = { program: 'wwbota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(2000);

  let bunkers: WwbotaBunker[] | null = null;

  // Try known endpoints
  for (const endpoint of WWBOTA_ENDPOINTS) {
    await rateLimit();
    try {
      console.log(`  Trying endpoint: ${endpoint}`);
      const res = await fetchWithRetry(endpoint, {}, 1, 3000);
      const data = await res.json();

      if (Array.isArray(data)) {
        bunkers = data as WwbotaBunker[];
        console.log(`  Success: got ${formatCount(bunkers.length)} bunkers`);
        break;
      } else if (data?.bunkers && Array.isArray(data.bunkers)) {
        bunkers = data.bunkers as WwbotaBunker[];
        console.log(`  Success: got ${formatCount(bunkers.length)} bunkers`);
        break;
      } else if (data?.data && Array.isArray(data.data)) {
        bunkers = data.data as WwbotaBunker[];
        console.log(`  Success: got ${formatCount(bunkers.length)} bunkers`);
        break;
      }
    } catch (err) {
      console.warn(`  Endpoint failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (!bunkers) {
    const msg = 'No WWBOTA endpoint returned valid data. WWBOTA import skipped.';
    console.warn(`  WARNING: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'wwbota.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Process bunkers
  for (const bunker of bunkers) {
    const code = bunker.reference ?? bunker.ref ?? bunker.code;
    const name = bunker.name ?? bunker.bunkerName ?? bunker.title ?? '';
    const lat = bunker.latitude ?? bunker.lat;
    const lon = bunker.longitude ?? bunker.lon ?? bunker.lng ?? bunker.long;

    if (!code || lat === undefined || lon === undefined) {
      result.skipped++;
      continue;
    }

    if (!isValidCoordinate(lon, lat)) {
      result.skipped++;
      continue;
    }

    features.push(
      createFeature(lon, lat, {
        code,
        program: 'wwbota',
        name,
        region: bunker.country ?? bunker.countryCode ?? bunker.region,
        lastActivation: bunker.lastActivation,
      })
    );
  }

  // Write GeoJSON
  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'wwbota.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} WWBOTA bunkers to ${outputPath}`);

  return result;
}
