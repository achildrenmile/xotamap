/**
 * ILLW (International Lighthouse Lightship Weekend) reference data importer.
 *
 * Strategy:
 *   Fetch all ILLW lighthouses from CQG MA: /gmamap/load_illw.php
 *
 * Source: https://www.cqgma.org/gmamap/
 */

import type { ImportResult, ReferenceFeature } from './types.js';
import {
  fetchWithRetry,
  createFeature,
  createFeatureCollection,
  isValidCoordinate,
  logSection,
  formatCount,
} from './utils.js';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

interface IllwLighthouse {
  id: number;
  illw: string;
  name: string;
  arlhs?: string;
  wlota?: number | string;
  iota?: string;
  dxcc?: string;
  locator?: string;
  latitude: number;
  longitude: number;
}

export async function importIllw(): Promise<ImportResult> {
  logSection('ILLW — International Lighthouse Lightship Weekend');
  const result: ImportResult = { program: 'illw', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];

  console.log('  Fetching ILLW lighthouses...');
  let lighthouses: IllwLighthouse[];
  try {
    const res = await fetchWithRetry('https://www.cqgma.org/gmamap/load_illw.php');
    lighthouses = await res.json() as IllwLighthouse[];
    console.log(`  Received ${formatCount(lighthouses.length)} lighthouses`);
  } catch (err) {
    const msg = `Failed to fetch ILLW data: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'illw.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  for (const lh of lighthouses) {
    if (!lh.illw) {
      result.skipped++;
      continue;
    }

    if (!isValidCoordinate(lh.longitude, lh.latitude)) {
      result.skipped++;
      continue;
    }

    features.push(
      createFeature(lh.longitude, lh.latitude, {
        code: lh.illw,
        program: 'illw',
        name: lh.name ?? '',
        region: lh.dxcc ?? undefined,
      })
    );
  }

  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'illw.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} ILLW lighthouses to ${outputPath}`);

  return result;
}
