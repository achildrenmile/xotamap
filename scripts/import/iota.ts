/**
 * IOTA (Islands On The Air) reference data importer.
 *
 * Strategy:
 *   IOTA provides JSON downloads of all island groups and islands.
 *   Available from https://www.iota-world.org/islands-on-the-air/downloads.html
 *   No API key required.
 *
 * Source: https://www.iota-world.org
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

// Known IOTA download endpoints
const IOTA_ENDPOINTS = [
  'https://www.iota-world.org/json/iota_groups.json',
  'https://www.iota-world.org/json/iota_islands.json',
  'https://www.iota-world.org/iota-downloads/iota_groups.json',
];

interface IotaGroup {
  groupRef?: string;
  ref?: string;
  reference?: string;
  groupName?: string;
  name?: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lon?: number;
  lng?: number;
  continent?: string;
  dxcc?: string;
  dxccEntity?: string;
  prefix?: string;
  midLat?: number;
  midLon?: number;
}

interface IotaIsland {
  islandRef?: string;
  groupRef?: string;
  name?: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lon?: number;
  lng?: number;
}

export async function importIota(): Promise<ImportResult> {
  logSection('IOTA — Islands On The Air');
  const result: ImportResult = { program: 'iota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];

  // Try to fetch IOTA group data
  let groupData: IotaGroup[] | null = null;

  for (const endpoint of IOTA_ENDPOINTS) {
    try {
      console.log(`  Trying endpoint: ${endpoint}`);
      const res = await fetchWithRetry(endpoint, {}, 1, 3000);
      const data = await res.json();

      if (Array.isArray(data)) {
        groupData = data as IotaGroup[];
        console.log(`  Success: got ${formatCount(groupData.length)} records`);
        break;
      } else if (data?.groups && Array.isArray(data.groups)) {
        groupData = data.groups as IotaGroup[];
        console.log(`  Success: got ${formatCount(groupData.length)} groups`);
        break;
      } else if (data?.islands && Array.isArray(data.islands)) {
        // Islands file — convert to group-like entries
        const islands = data.islands as IotaIsland[];
        console.log(`  Got ${formatCount(islands.length)} individual islands, processing...`);

        // Group by group reference, use first island's coordinates per group
        const groupMap = new Map<string, IotaGroup>();
        for (const island of islands) {
          const ref = island.groupRef ?? island.islandRef;
          if (!ref || groupMap.has(ref)) continue;

          const lat = island.latitude ?? island.lat;
          const lon = island.longitude ?? island.lon ?? island.lng;
          if (lat === undefined || lon === undefined) continue;

          groupMap.set(ref, {
            groupRef: ref,
            groupName: island.name,
            latitude: lat,
            longitude: lon,
          });
        }
        groupData = Array.from(groupMap.values());
        console.log(`  Consolidated to ${formatCount(groupData.length)} groups`);
        break;
      }
    } catch (err) {
      console.warn(`  Endpoint failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  if (!groupData) {
    const msg = 'No IOTA endpoint returned valid data. IOTA import skipped.';
    console.warn(`  WARNING: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'iota.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Process groups
  for (const group of groupData) {
    const code = group.groupRef ?? group.ref ?? group.reference;
    const name = group.groupName ?? group.name ?? '';
    const lat = group.latitude ?? group.lat ?? group.midLat;
    const lon = group.longitude ?? group.lon ?? group.lng ?? group.midLon;

    if (!code || lat === undefined || lon === undefined) {
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
        program: 'iota',
        name,
        region: group.continent ?? group.dxcc ?? group.dxccEntity,
      })
    );
  }

  // Write GeoJSON
  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'iota.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} IOTA groups to ${outputPath}`);

  return result;
}
