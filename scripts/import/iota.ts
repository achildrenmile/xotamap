/**
 * IOTA (Islands On The Air) reference data importer.
 *
 * Strategy:
 *   Use GMA's IOTA endpoint which provides center coordinates per group.
 *   Fetches per continent: EU, AF, AS, NA, SA, OC, AN.
 *   Fallback: IOTA official groups.json with bounding boxes (compute center).
 *
 * Sources:
 *   - https://www.cqgma.org/gmamap/load_iota.php?continent=XX
 *   - https://www.iota-world.org/islands-on-the-air/downloads/
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
const CONTINENTS = ['EU', 'AF', 'AS', 'NA', 'SA', 'OC', 'AN'];

interface GmaIotaGroup {
  ref: string;
  name: string;
  centerLat: number;
  centerLng: number;
  locator?: string;
}

interface OfficialIotaGroup {
  refno: string;
  name: string;
  latitude_max: number;
  latitude_min: number;
  longitude_max: number;
  longitude_min: number;
  dxcc_num?: number;
  pc_credited?: number;
}

export async function importIota(): Promise<ImportResult> {
  logSection('IOTA — Islands On The Air');
  const result: ImportResult = { program: 'iota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];
  const seenCodes = new Set<string>();

  // Strategy 1: GMA's IOTA endpoint (has center coordinates)
  let gmaSuccess = false;
  console.log('  Trying GMA IOTA endpoints (per continent)...');

  for (const continent of CONTINENTS) {
    try {
      const res = await fetchWithRetry(
        `https://www.cqgma.org/gmamap/load_iota.php?continent=${continent}`,
        {},
        2,
        2000
      );
      const data = await res.json() as GmaIotaGroup[];

      if (Array.isArray(data)) {
        for (const group of data) {
          if (seenCodes.has(group.ref)) continue;
          seenCodes.add(group.ref);

          if (!isValidCoordinate(group.centerLng, group.centerLat)) {
            result.skipped++;
            continue;
          }

          features.push(
            createFeature(group.centerLng, group.centerLat, {
              code: group.ref,
              program: 'iota',
              name: group.name,
              region: continent,
            })
          );
        }
        gmaSuccess = true;
      }
    } catch (err) {
      console.warn(`  WARNING: GMA IOTA ${continent} failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (gmaSuccess && features.length > 0) {
    console.log(`  GMA endpoint: got ${formatCount(features.length)} IOTA groups`);
  } else {
    // Strategy 2: Official IOTA groups.json (bounding boxes → compute center)
    console.log('  GMA failed, trying official IOTA download...');
    try {
      const res = await fetchWithRetry(
        'https://www.iota-world.org/islands-on-the-air/downloads/download-file.html?path=groups.json',
        {},
        2,
        5000
      );
      const data = await res.json() as OfficialIotaGroup[];

      if (Array.isArray(data)) {
        for (const group of data) {
          const code = group.refno;
          if (!code || seenCodes.has(code)) continue;
          seenCodes.add(code);

          const lat = (group.latitude_max + group.latitude_min) / 2;
          const lon = (group.longitude_max + group.longitude_min) / 2;

          if (!isValidCoordinate(lon, lat)) {
            result.skipped++;
            continue;
          }

          features.push(
            createFeature(lon, lat, {
              code,
              program: 'iota',
              name: group.name,
            })
          );
        }
        console.log(`  Official endpoint: got ${formatCount(features.length)} IOTA groups`);
      }
    } catch (err) {
      const msg = `Failed to fetch IOTA data: ${err instanceof Error ? err.message : err}`;
      console.warn(`  WARNING: ${msg}`);
      result.errors.push(msg);
    }
  }

  if (features.length === 0) {
    const msg = 'No IOTA data could be imported from any source.';
    console.warn(`  WARNING: ${msg}`);
    result.errors.push(msg);
  }

  // Write GeoJSON
  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'iota.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} IOTA groups to ${outputPath}`);

  return result;
}
