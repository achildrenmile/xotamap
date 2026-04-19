/**
 * Shared types for xOTA reference data import scripts.
 * All importers produce GeoJSON FeatureCollections with these property types.
 */

export interface ReferenceProperties {
  /** Reference code, e.g. "OE/TI-001", "K-0001" */
  code: string;
  /** Program identifier (lowercase), e.g. "sota", "pota", "gma" */
  program: string;
  /** Human-readable name, e.g. "Großglockner" */
  name: string;
  /** Elevation in metres (if applicable) */
  elevation?: number;
  /** Points value for activation/chasing */
  points?: number;
  /** Region or association code, e.g. "OE", "K" */
  region?: string;
  /** ISO date string of last activation */
  lastActivation?: string;
}

export interface ReferenceFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: ReferenceProperties;
}

export interface ReferenceFeatureCollection {
  type: 'FeatureCollection';
  features: ReferenceFeature[];
}

export interface ImportResult {
  program: string;
  count: number;
  errors: string[];
  skipped: number;
}
