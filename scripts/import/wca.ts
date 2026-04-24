/**
 * WCA (World Castles Award) / COTA reference data importer.
 *
 * Strategy:
 *   1. Fetch prefix list from CQG MA: /gmamap/load_cota_prefixes.php
 *   2. For each prefix, fetch castles from /gmamap/load_cota.php?prefix=XXX
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

interface CotaCastle {
  rec?: number;
  ref: string;
  name: string;
  latitude: number;
  longitude: number;
  locator?: string;
  cota?: string;
  ort?: string;
  url?: string;
}

export async function importWca(): Promise<ImportResult> {
  logSection('WCA ��� World Castles Award');
  const result: ImportResult = { program: 'wca', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(300);
  const seenCodes = new Set<string>();

  // Step 1: Fetch all prefixes
  console.log('  Fetching COTA prefixes...');
  let prefixes: string[];
  try {
    const res = await fetchWithRetry(`${BASE_URL}/load_cota_prefixes.php`);
    prefixes = await res.json() as string[];
    console.log(`  Found ${formatCount(prefixes.length)} prefixes`);
  } catch (err) {
    const msg = `Failed to fetch COTA prefixes: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'wca.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Step 2: Fetch castles per prefix
  let processed = 0;
  for (const prefix of prefixes) {
    await rateLimit();
    processed++;
    try {
      const res = await fetchWithRetry(
        `${BASE_URL}/load_cota.php?prefix=${encodeURIComponent(prefix)}`,
        {},
        2,
        1000
      );
      const castles = await res.json() as CotaCastle[];

      if (!Array.isArray(castles)) continue;

      for (const castle of castles) {
        if (!castle.ref || seenCodes.has(castle.ref)) continue;
        seenCodes.add(castle.ref);

        if (!isValidCoordinate(castle.longitude, castle.latitude)) {
          result.skipped++;
          continue;
        }

        features.push(
          createFeature(castle.longitude, castle.latitude, {
            code: castle.ref,
            program: 'wca',
            name: castle.name ?? '',
            region: prefix,
          })
        );
      }

      if (processed % 10 === 0) {
        console.log(`  Progress: ${processed}/${prefixes.length} prefixes, ${formatCount(features.length)} castles`);
      }
    } catch (err) {
      const msg = `Failed to fetch COTA prefix ${prefix}: ${err instanceof Error ? err.message : err}`;
      console.warn(`  WARNING: ${msg}`);
      result.errors.push(msg);
    }
  }

  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'wca.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} WCA castles to ${outputPath}`);

  return result;
}
