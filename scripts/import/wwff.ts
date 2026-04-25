/**
 * WWFF (World Wide Flora & Fauna) reference data importer.
 *
 * Strategy:
 *   Download the official WWFF directory CSV which contains all references
 *   with coordinates.
 *
 * Source: https://wwff.co/wwff-data/wwff_directory.csv
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

const CSV_URL = 'https://wwff.co/wwff-data/wwff_directory.csv';
const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

export async function importWwff(): Promise<ImportResult> {
  logSection('WWFF — World Wide Flora & Fauna');
  const result: ImportResult = { program: 'wwff', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];

  console.log('  Downloading WWFF directory CSV...');
  let csvText: string;
  try {
    const res = await fetchWithRetry(CSV_URL, {
      headers: { Accept: 'text/csv' },
    });
    csvText = await res.text();
    console.log(`  Downloaded ${formatCount(csvText.length)} bytes`);
  } catch (err) {
    const msg = `Failed to download WWFF CSV: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'wwff.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  const lines = csvText.split('\n');
  if (lines.length < 2) {
    result.errors.push('WWFF CSV is empty');
    writeFileSync(join(OUTPUT_DIR, 'wwff.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Parse header to find column indices
  const header = parseCsvLine(lines[0]);
  const colIdx: Record<string, number> = {};
  header.forEach((h, i) => { colIdx[h.trim().toLowerCase()] = i; });

  const refIdx = colIdx['reference'];
  const nameIdx = colIdx['name'];
  const latIdx = colIdx['latitude'];
  const lonIdx = colIdx['longitude'];
  const statusIdx = colIdx['status'];
  const programIdx = colIdx['program'];

  if (refIdx === undefined || latIdx === undefined || lonIdx === undefined) {
    result.errors.push('WWFF CSV missing required columns');
    writeFileSync(join(OUTPUT_DIR, 'wwff.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCsvLine(line);
    const ref = fields[refIdx]?.trim();
    const name = fields[nameIdx]?.trim() ?? '';
    const lat = parseFloat(fields[latIdx]);
    const lon = parseFloat(fields[lonIdx]);
    const status = fields[statusIdx]?.trim().toLowerCase();
    const prefix = fields[programIdx]?.trim();

    // Skip inactive references
    if (status && status !== 'active') {
      result.skipped++;
      continue;
    }

    if (!ref || isNaN(lat) || isNaN(lon)) {
      result.skipped++;
      continue;
    }

    if (!isValidCoordinate(lon, lat)) {
      result.skipped++;
      continue;
    }

    features.push(
      createFeature(lon, lat, {
        code: ref,
        program: 'wwff',
        name,
        region: prefix ?? undefined,
      })
    );
  }

  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'wwff.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} WWFF references to ${outputPath}`);

  return result;
}
