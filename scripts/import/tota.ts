/**
 * TOTA (Towers On The Air / WWTOTA) reference data importer.
 *
 * Strategy:
 *   Scrape the tower list page at wwtota.com/seznam/ which embeds all tower
 *   data as a JavaScript `rows` array with coordinates.
 *
 * Source: https://wwtota.com/seznam/
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

const LIST_URL = 'https://wwtota.com/seznam/';
const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

/**
 * Parse the embedded `rows` JavaScript array from the HTML page.
 * The data is a 2D array: first row is headers, rest are tower records.
 * Fields: Ref, Name, Municipality, District, Region, Elevation, Height, Locator, Lat, Lon, Accessible, Distance
 */
function parseRowsFromHtml(html: string): string[][] {
  // Find the rows = [...] assignment in the page script
  const match = html.match(/\brows\s*=\s*(\[[\s\S]*?\]);\s*(?:var|let|const|function|\/\/|\n)/);
  if (!match) {
    // Try alternate pattern
    const match2 = html.match(/\brows\s*=\s*(\[\s*\[[\s\S]*?\]\s*\])/);
    if (!match2) return [];
    try {
      return JSON.parse(match2[1]) as string[][];
    } catch {
      return [];
    }
  }
  try {
    return JSON.parse(match[1]) as string[][];
  } catch {
    return [];
  }
}

export async function importTota(): Promise<ImportResult> {
  logSection('TOTA — Towers On The Air');
  const result: ImportResult = { program: 'tota', count: 0, errors: [], skipped: 0 };
  const features: ReferenceFeature[] = [];

  console.log('  Fetching TOTA tower list...');
  let html: string;
  try {
    const res = await fetchWithRetry(LIST_URL, {
      headers: { Accept: 'text/html' },
    });
    html = await res.text();
    console.log(`  Downloaded ${formatCount(html.length)} bytes`);
  } catch (err) {
    const msg = `Failed to download TOTA list: ${err instanceof Error ? err.message : err}`;
    console.error(`  ERROR: ${msg}`);
    result.errors.push(msg);
    writeFileSync(join(OUTPUT_DIR, 'tota.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  const rows = parseRowsFromHtml(html);
  if (rows.length < 2) {
    result.errors.push('Could not parse tower data from TOTA page');
    writeFileSync(join(OUTPUT_DIR, 'tota.geojson'), JSON.stringify(createFeatureCollection([])));
    return result;
  }

  console.log(`  Parsed ${formatCount(rows.length - 1)} tower rows`);

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 10) {
      result.skipped++;
      continue;
    }

    const ref = row[0]?.trim();
    const name = row[1]?.trim() ?? '';
    const lat = parseFloat(row[8]);
    const lon = parseFloat(row[9]);

    if (!ref || isNaN(lat) || isNaN(lon)) {
      result.skipped++;
      continue;
    }

    if (!isValidCoordinate(lon, lat)) {
      result.skipped++;
      continue;
    }

    // Extract country prefix from reference (e.g., OKR-0001 -> OKR)
    const prefix = ref.split('-')[0] ?? undefined;

    features.push(
      createFeature(lon, lat, {
        code: ref,
        program: 'tota',
        name,
        region: prefix,
      })
    );
  }

  const collection = createFeatureCollection(features);
  const outputPath = join(OUTPUT_DIR, 'tota.geojson');
  writeFileSync(outputPath, JSON.stringify(collection));
  result.count = features.length;
  console.log(`  Written ${formatCount(result.count)} TOTA towers to ${outputPath}`);

  return result;
}
