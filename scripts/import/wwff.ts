/**
 * WWFF (World Wide Flora & Fauna) reference data importer.
 *
 * Strategy:
 *   1. Fetch prefix list from CQG MA: /gmamap/load_wwff_prefixes.php
 *   2. For each prefix, fetch references from /gmamap/load_wwff.php?prefix=XXX
 *   3. Normalize to GeoJSON FeatureCollection
 *
 * Source: https://www.cqgma.org/gmamap/
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

const BASE_URL = 'https://www.cqgma.org/gmamap';
const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

interface WwffRef {
  ref: string;
  name: string;
  latitude: number;
  longitude: number;
  label?: string;
}

export async function importWwff(): Promise<ImportResult> {
  logSection('WWFF — World Wide Flora & Fauna');
  const result: ImportResult = { program: 'wwff', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(300);
  const seenCodes = new Set<string>();

  // Step 1: Fetch all prefixes
  console.log('  Fetching WWFF prefixes...');
  let prefixes: string[];
  try {
    const res = await fetchWithRetry(`${BASE_URL}/load_wwff_prefixes.php`);
    prefixes = await res.json() as string[];
    console.log(`  Found ${formatCount(prefixes.length)} prefixes`);
  } catch (err) {
    const msg = `Failed to fetch WWFF prefixes: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'wwff.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Step 2: Fetch references per prefix
  let processed = 0;
  for (const prefix of prefixes) {
    await rateLimit();
    processed++;
    try {
      const res = await fetchWithRetry(
        `${BASE_URL}/load_wwff.php?prefix=${encodeURIComponent(prefix)}`,
        {},
        2,
        1000
      );
      const refs = await res.json() as WwffRef[];

      if (!Array.isArray(refs)) continue;

      for (const ref of refs) {
        if (!ref.ref || seenCodes.has(ref.ref)) continue;
        seenCodes.add(ref.ref);

        if (!isValidCoordinate(ref.longitude, ref.latitude)) {
          result.skipped++;
          continue;
        }

        features.push(
          createFeature(ref.longitude, ref.latitude, {
            code: ref.ref,
            program: 'wwff',
            name: ref.name ?? '',
            region: prefix,
          })
        );
      }

      if (processed % 50 === 0) {
        console.log(`  Progress: ${processed}/${prefixes.length} prefixes, ${formatCount(features.length)} refs`);
      }
    } catch (err) {
      const msg = `Failed to fetch WWFF prefix ${prefix}: ${err instanceof Error ? err.message : err}`;
      console.warn(`  WARNING: ${msg}`);
      result.errors.push(msg);
    }
  }

  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'wwff.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} WWFF references to ${outputPath}`);

  return result;
}
