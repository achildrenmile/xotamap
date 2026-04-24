/**
 * ARLHS (Amateur Radio Lighthouse Society) reference data importer.
 *
 * Strategy:
 *   Fetch all ARLHS lighthouses from CQG MA: /gmamap/load_arlhs.php
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

interface ArlhsLighthouse {
  id: number;
  arlhs: string;
  illw?: string;
  wlota?: number | string;
  name: string;
  iota?: string;
  dxcc?: string;
  locator?: string;
  latitude: number;
  longitude: number;
}

export async function importArlhs(): Promise<ImportResult> {
  logSection('ARLHS �� Amateur Radio Lighthouse Society');
  const result: ImportResult = { program: 'arlhs', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];

  console.log('  Fetching ARLHS lighthouses...');
  let lighthouses: ArlhsLighthouse[];
  try {
    const res = await fetchWithRetry('https://www.cqgma.org/gmamap/load_arlhs.php');
    lighthouses = await res.json() as ArlhsLighthouse[];
    console.log(`  Received ${formatCount(lighthouses.length)} lighthouses`);
  } catch (err) {
    const msg = `Failed to fetch ARLHS data: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'arlhs.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  for (const lh of lighthouses) {
    if (!lh.arlhs) {
      result.skipped++;
      continue;
    }

    if (!isValidCoordinate(lh.longitude, lh.latitude)) {
      result.skipped++;
      continue;
    }

    features.push(
      createFeature(lh.longitude, lh.latitude, {
        code: lh.arlhs,
        program: 'arlhs',
        name: lh.name ?? '',
        region: lh.dxcc ?? undefined,
      })
    );
  }

  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'arlhs.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} ARLHS lighthouses to ${outputPath}`);

  return result;
}
