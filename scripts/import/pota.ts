/**
 * POTA (Parks On The Air) reference data importer.
 *
 * Strategy:
 *   1. Fetch program/location hierarchy from /programs/locations/
 *   2. Extract flat location list from nested programs→entities→locations
 *   3. For each location, fetch parks from /location/parks/{descriptor}
 *   4. Normalize to GeoJSON FeatureCollection
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
  logSection,
  formatCount,
} from './utils.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE_URL = 'https://api.pota.app';
const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

interface PotaLocationEntry {
  locationId: number;
  descriptor: string;
  name: string;
  parks?: number;
}

interface PotaPark {
  reference: string;
  name: string;
  latitude: number;
  longitude: number;
  grid?: string;
  locationDesc?: string;
  activations?: number;
  qsos?: number;
}

export async function importPota(): Promise<ImportResult> {
  logSection('POTA — Parks On The Air');
  const result: ImportResult = { program: 'pota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(500);
  const seenCodes = new Set<string>();

  // Step 1: Fetch program/location hierarchy
  console.log('  Fetching program locations...');
  let locationDescriptors: { descriptor: string; name: string }[];
  try {
    const res = await fetchWithRetry(`${BASE_URL}/programs/locations/`);
    const programs = await res.json() as Array<{
      entities?: Array<{
        locations?: Array<{ descriptor: string; name: string; parks?: number }>;
      }>;
    }>;

    // Flatten nested structure to get all location descriptors
    locationDescriptors = [];
    for (const prog of programs) {
      for (const entity of prog.entities ?? []) {
        for (const loc of entity.locations ?? []) {
          // Only fetch locations that have parks
          if ((loc.parks ?? 0) > 0) {
            locationDescriptors.push({ descriptor: loc.descriptor, name: loc.name });
          }
        }
      }
    }

    console.log(`  Found ${formatCount(locationDescriptors.length)} locations with parks`);
  } catch (err) {
    const msg = `Failed to fetch POTA locations: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    return result;
  }

  // Step 2: Fetch parks per location
  let processed = 0;
  for (const loc of locationDescriptors) {
    await rateLimit();
    processed++;
    try {
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
            lastActivation: undefined,
          })
        );
      }

      if (processed % 100 === 0) {
        console.log(`  Progress: ${processed}/${locationDescriptors.length} locations, ${formatCount(features.length)} parks`);
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
