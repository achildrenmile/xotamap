import { Protocol } from 'pmtiles';
import maplibregl from 'maplibre-gl';

let initialized = false;

/**
 * Register the PMTiles protocol with MapLibre GL JS.
 * Safe to call multiple times; only registers once.
 */
export function initPMTiles(): void {
  if (initialized) return;
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  initialized = true;
}

/**
 * Return a MapLibre vector source spec pointing at a local PMTiles file
 * for the given xOTA program (e.g. "sota", "pota", "wwff").
 */
export function getPMTilesSource(program: string): {
  type: 'vector';
  url: string;
} {
  return {
    type: 'vector',
    url: `pmtiles:///data/references/${program}.pmtiles`,
  };
}
