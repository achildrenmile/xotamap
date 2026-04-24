/**
 * WLOTA (World Lighthouse On The Air) reference data importer.
 *
 * Strategy:
 *   Fetch all lighthouses from CQG MA: /gmamap/load_wlota.php
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

interface WlotaLighthouse {
  id: number;
  wlota: number;
  illw?: string;
  arlhs?: string;
  name: string;
  iota?: string;
  dxcc?: string;
  locator?: string;
  latitude: number;
  longitude: number;
}

export async function importWlota(): Promise<ImportResult> {
  logSection('WLOTA — World Lighthouse On The Air');
  const result: ImportResult = { program: 'wlota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];

  console.log('  Fetching WLOTA lighthouses...');
  let lighthouses: WlotaLighthouse[];
  try {
    const res = await fetchWithRetry('https://www.cqgma.org/gmamap/load_wlota.php');
    lighthouses = await res.json() as WlotaLighthouse[];
    console.log(`  Received ${formatCount(lighthouses.length)} lighthouses`);
  } catch (err) {
    const msg = `Failed to fetch WLOTA data: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'wlota.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  for (const lh of lighthouses) {
    if (!isValidCoordinate(lh.longitude, lh.latitude)) {
      result.skipped++;
      continue;
    }

    const code = `WLOTA-${String(lh.wlota).padStart(4, '0')}`;

    features.push(
      createFeature(lh.longitude, lh.latitude, {
        code,
        program: 'wlota',
        name: lh.name ?? '',
        region: lh.dxcc ?? undefined,
      })
    );
  }

  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'wlota.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} WLOTA lighthouses to ${outputPath}`);

  return result;
}
