/**
 * Build overlap grid for multi-program reference detection.
 *
 * Reads all GeoJSON reference files and creates a grid of 0.25deg x 0.25deg cells.
 * For each cell that contains references, writes a JSON file listing all references
 * grouped by program.
 *
 * Output: public/data/overlaps/grid/{lat}_{lon}.json
 * Only cells with at least one reference are written (skip empty cells).
 *
 * Usage: npx tsx scripts/build-overlaps.ts
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { ReferenceFeatureCollection } from './import/types.js';

const REFERENCES_DIR = join(process.cwd(), 'public/data/references');
const GRID_DIR = join(process.cwd(), 'public/data/overlaps/grid');
const CELL_SIZE = 0.25; // degrees

interface CellReference {
  code: string;
  program: string;
  name: string;
  coordinates: [number, number];
}

interface CellData {
  lat: number;
  lon: number;
  programs: string[];
  count: number;
  references: CellReference[];
}

/**
 * Snap a coordinate to its grid cell origin (southwest corner).
 */
function snapToGrid(value: number): number {
  return Math.floor(value / CELL_SIZE) * CELL_SIZE;
}

/**
 * Create a cell key from lat/lon for the grid map.
 */
function cellKey(lat: number, lon: number): string {
  // Format to avoid floating point issues: use fixed precision
  const latStr = lat.toFixed(2);
  const lonStr = lon.toFixed(2);
  return `${latStr}_${lonStr}`;
}

function main(): void {
  console.log('Building overlap grid...');
  console.log(`  Cell size: ${CELL_SIZE} degrees`);
  console.log(`  Reading from: ${REFERENCES_DIR}`);
  console.log(`  Writing to: ${GRID_DIR}`);

  // Clean and create output directory
  if (existsSync(GRID_DIR)) {
    rmSync(GRID_DIR, { recursive: true });
  }
  mkdirSync(GRID_DIR, { recursive: true });

  // Read all GeoJSON files
  const files = readdirSync(REFERENCES_DIR).filter(f => f.endsWith('.geojson'));

  if (files.length === 0) {
    console.log('  No GeoJSON files found. Nothing to build.');
    return;
  }

  // Accumulate references into grid cells
  const grid = new Map<string, CellData>();
  let totalReferences = 0;

  for (const file of files) {
    const program = file.replace('.geojson', '');
    const filePath = join(REFERENCES_DIR, file);

    try {
      const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as ReferenceFeatureCollection;

      if (!raw.features || !Array.isArray(raw.features)) {
        console.warn(`  Skipping ${file}: no features array`);
        continue;
      }

      console.log(`  Processing ${file}: ${raw.features.length} features`);

      for (const feature of raw.features) {
        const [lon, lat] = feature.geometry.coordinates;

        if (isNaN(lat) || isNaN(lon)) continue;

        const gridLat = snapToGrid(lat);
        const gridLon = snapToGrid(lon);
        const key = cellKey(gridLat, gridLon);

        let cell = grid.get(key);
        if (!cell) {
          cell = {
            lat: gridLat,
            lon: gridLon,
            programs: [],
            count: 0,
            references: [],
          };
          grid.set(key, cell);
        }

        cell.references.push({
          code: feature.properties.code,
          program: feature.properties.program,
          name: feature.properties.name,
          coordinates: [lon, lat],
        });
        cell.count++;

        if (!cell.programs.includes(program)) {
          cell.programs.push(program);
        }

        totalReferences++;
      }
    } catch (err) {
      console.error(`  Error reading ${file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  // Write grid cells (only non-empty)
  let cellsWritten = 0;
  let multiProgramCells = 0;

  for (const [key, cell] of grid) {
    const outputPath = join(GRID_DIR, `${key}.json`);
    writeFileSync(outputPath, JSON.stringify(cell));
    cellsWritten++;

    if (cell.programs.length > 1) {
      multiProgramCells++;
    }
  }

  console.log('\nOverlap grid summary:');
  console.log(`  Total references processed: ${totalReferences.toLocaleString()}`);
  console.log(`  Grid cells written: ${cellsWritten.toLocaleString()}`);
  console.log(`  Multi-program cells: ${multiProgramCells.toLocaleString()}`);
  console.log('  Done.');
}

main();
