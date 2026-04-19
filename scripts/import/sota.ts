/**
 * SOTA (Summits On The Air) reference data importer.
 *
 * Strategy:
 *   1. Fetch list of associations from /api/associations
 *   2. For each association, fetch summits from /api/associations/{code}
 *   3. Normalize to GeoJSON FeatureCollection
 *
 * API: https://api2.sota.org.uk/api/
 * Docs: https://api2.sota.org.uk/docs/index.html
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

const BASE_URL = 'https://api2.sota.org.uk/api';
const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

interface SotaAssociation {
  associationCode: string;
  name: string;
}

interface SotaSummit {
  summitCode: string;
  name: string;
  latitude: number;
  longitude: number;
  points: number;
  altM: number;
  activationCount: number;
  activationDate?: string;
  regionCode?: string;
}

export async function importSota(): Promise<ImportResult> {
  logSection('SOTA — Summits On The Air');
  const result: ImportResult = { program: 'sota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(1500);

  // Step 1: Fetch all associations
  console.log('  Fetching associations...');
  let associations: SotaAssociation[];
  try {
    const res = await fetchWithRetry(`${BASE_URL}/associations`);
    associations = await res.json() as SotaAssociation[];
    console.log(`  Found ${formatCount(associations.length)} associations`);
  } catch (err) {
    const msg = `Failed to fetch SOTA associations: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    return result;
  }

  // Step 2: Fetch summits per association
  for (const assoc of associations) {
    await rateLimit();
    try {
      console.log(`  Fetching summits for ${assoc.associationCode} (${assoc.name})...`);
      const res = await fetchWithRetry(`${BASE_URL}/associations/${assoc.associationCode}`);
      const data = await res.json() as { regions?: Array<{ summits?: SotaSummit[] }> };

      const regions = data.regions ?? [];
      for (const region of regions) {
        const summits = region.summits ?? [];
        for (const summit of summits) {
          if (!isValidCoordinate(summit.longitude, summit.latitude)) {
            result.skipped++;
            continue;
          }

          features.push(
            createFeature(summit.longitude, summit.latitude, {
              code: summit.summitCode,
              program: 'sota',
              name: summit.name,
              elevation: parseNumber(summit.altM),
              points: parseNumber(summit.points),
              region: assoc.associationCode,
              lastActivation: summit.activationDate ?? undefined,
            })
          );
        }
      }
    } catch (err) {
      const msg = `Failed to fetch summits for ${assoc.associationCode}: ${err instanceof Error ? err.message : err}`;
      console.warn(`  WARNING: ${msg}`);
      result.errors.push(msg);
    }
  }

  // Step 3: Write GeoJSON
  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'sota.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} SOTA summits to ${outputPath}`);

  return result;
}
