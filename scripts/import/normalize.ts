/**
 * Normalizer for imported reference data.
 * Ensures all GeoJSON files have consistent property schemas.
 *
 * Can be run standalone or as part of the import pipeline to
 * re-normalize existing GeoJSON files.
 */

import type { ReferenceFeature, ReferenceFeatureCollection, ReferenceProperties } from './types.js';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(process.cwd(), 'public/data/references');

/**
 * Normalize a single feature's properties to the canonical schema.
 * Strips unexpected properties and ensures required fields exist.
 */
export function normalizeProperties(
  raw: Record<string, unknown>,
  fallbackProgram: string
): ReferenceProperties {
  return {
    code: String(raw.code ?? raw.reference ?? raw.ref ?? ''),
    program: String(raw.program ?? fallbackProgram).toLowerCase(),
    name: String(raw.name ?? raw.summitName ?? raw.parkName ?? ''),
    elevation: typeof raw.elevation === 'number' ? raw.elevation : undefined,
    points: typeof raw.points === 'number' ? raw.points : undefined,
    region: typeof raw.region === 'string' ? raw.region : undefined,
    lastActivation: typeof raw.lastActivation === 'string' ? raw.lastActivation : undefined,
  };
}

/**
 * Normalize a feature: ensure geometry is a Point and properties are canonical.
 */
export function normalizeFeature(
  feature: ReferenceFeature,
  fallbackProgram: string
): ReferenceFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [
        feature.geometry.coordinates[0],
        feature.geometry.coordinates[1],
      ],
    },
    properties: normalizeProperties(
      feature.properties as unknown as Record<string, unknown>,
      fallbackProgram
    ),
  };
}

/**
 * Normalize all GeoJSON files in the data directory.
 * Re-reads and re-writes each file with consistent property schema.
 */
export function normalizeAll(): void {
  console.log('\nNormalizing GeoJSON files...');

  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.geojson'));

  for (const file of files) {
    const program = file.replace('.geojson', '');
    const filePath = join(DATA_DIR, file);

    try {
      const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as ReferenceFeatureCollection;

      if (raw.type !== 'FeatureCollection' || !Array.isArray(raw.features)) {
        console.warn(`  Skipping ${file}: not a valid FeatureCollection`);
        continue;
      }

      const normalized: ReferenceFeatureCollection = {
        type: 'FeatureCollection',
        features: raw.features.map(f => normalizeFeature(f, program)),
      };

      writeFileSync(filePath, JSON.stringify(normalized));
      console.log(`  Normalized ${file}: ${normalized.features.length} features`);
    } catch (err) {
      console.error(`  Error normalizing ${file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('  Normalization complete.');
}
