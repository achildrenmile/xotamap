/**
 * GMA (Global Mountain Activity) reference data importer.
 *
 * Strategy:
 *   1. Fetch region list from /gmamap/load_gma_regions.php
 *   2. For each region, fetch summits from /gmamap/load_gma.php?region=XXX
 *   3. Response is GeoJSON FeatureCollection per region
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

const BASE_URL = 'https://www.cqgma.org/gmamap';
const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

export async function importGma(): Promise<ImportResult> {
  logSection('GMA — Global Mountain Activity');
  const result: ImportResult = { program: 'gma', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const rateLimit = createRateLimiter(300);

  // Step 1: Fetch all region codes
  console.log('  Fetching region list...');
  let regions: string[];
  try {
    const res = await fetchWithRetry(`${BASE_URL}/load_gma_regions.php`);
    regions = await res.json() as string[];
    console.log(`  Found ${formatCount(regions.length)} regions`);
  } catch (err) {
    const msg = `Failed to fetch GMA regions: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'gma.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Step 2: Fetch summits per region
  let processed = 0;
  for (const region of regions) {
    await rateLimit();
    processed++;
    try {
      const res = await fetchWithRetry(
        `${BASE_URL}/load_gma.php?region=${encodeURIComponent(region)}`,
        {},
        2,
        1000
      );
      const data = await res.json() as {
        type?: string;
        features?: Array<{
          geometry?: { coordinates?: number[] };
          properties?: { ref?: string; name?: string; points?: number };
        }>;
      };

      if (data?.type === 'FeatureCollection' && Array.isArray(data.features)) {
        for (const f of data.features) {
          const lon = f.geometry?.coordinates?.[0];
          const lat = f.geometry?.coordinates?.[1];
          const code = f.properties?.ref;
          const name = f.properties?.name ?? '';

          if (!code || lon === undefined || lat === undefined) {
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
              program: 'gma',
              name,
              points: parseNumber(f.properties?.points),
              region,
            })
          );
        }
      }

      if (processed % 100 === 0) {
        console.log(`  Progress: ${processed}/${regions.length} regions, ${formatCount(features.length)} summits`);
      }
    } catch (err) {
      const msg = `Failed to fetch GMA region ${region}: ${err instanceof Error ? err.message : err}`;
      console.warn(`  WARNING: ${msg}`);
      result.errors.push(msg);
    }
  }

  // Write GeoJSON
  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'gma.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} GMA summits to ${outputPath}`);

  return result;
}
