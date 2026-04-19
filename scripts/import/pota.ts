/**
 * POTA (Parks On The Air) reference data importer.
 *
 * Strategy:
 *   1. Fetch all park locations via /programs/locations/ (paginated by location/country)
 *   2. Or use /location/parks/{locationCode} per country
 *   3. Normalize to GeoJSON FeatureCollection
 *
 * API: https://api.pota.app/
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

const BASE_URL = 'https://api.pota.app';
const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

interface PotaLocation {
  locationId: number;
  descriptor: string;
  locationName: string;
  entityId?: number;
  parks?: number;
}

interface PotaPark {
  reference: string;
  name: string;
  latitude: number;
  longitude: number;
  grid?: string;
  locationDesc?: string;
  locationName?: string;
  entityName?: string;
  parktypeId?: number;
  parktypeDesc?: string;
  activations?: number;
  lastActivation?: string;
}

export async function importPota(): Promise<ImportResult> {
  logSection('POTA — Parks On The Air');
  const result: ImportResult = { program: 'pota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(2000);
  const seenCodes = new Set<string>();

  // Step 1: Fetch all program locations
  console.log('  Fetching program locations...');
  let locations: PotaLocation[];
  try {
    const res = await fetchWithRetry(`${BASE_URL}/programs/locations/`);
    locations = await res.json() as PotaLocation[];
    console.log(`  Found ${formatCount(locations.length)} locations`);
  } catch (err) {
    const msg = `Failed to fetch POTA locations: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    return result;
  }

  // Step 2: Fetch parks per location
  for (const loc of locations) {
    await rateLimit();
    try {
      console.log(`  Fetching parks for ${loc.descriptor} (${loc.locationName})...`);
      const res = await fetchWithRetry(`${BASE_URL}/location/parks/${loc.descriptor}`);
      const parks = await res.json() as PotaPark[];

      for (const park of parks) {
        if (seenCodes.has(park.reference)) continue;
        seenCodes.add(park.reference);

        if (!isValidCoordinate(park.longitude, park.latitude)) {
          result.skipped++;
          continue;
        }

        features.push(
          createFeature(park.longitude, park.latitude, {
            code: park.reference,
            program: 'pota',
            name: park.name,
            region: loc.descriptor,
            lastActivation: park.lastActivation ?? undefined,
          })
        );
      }
    } catch (err) {
      const msg = `Failed to fetch parks for ${loc.descriptor}: ${err instanceof Error ? err.message : err}`;
      console.warn(`  WARNING: ${msg}`);
      result.errors.push(msg);
    }
  }

  // Step 3: Write GeoJSON
  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'pota.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} POTA parks to ${outputPath}`);

  return result;
}
