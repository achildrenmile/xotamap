/**
 * Shared utilities for xOTA reference data importers.
 * Provides fetch-with-retry, rate limiting, and GeoJSON helpers.
 */

import type { ReferenceFeature, ReferenceFeatureCollection, ReferenceProperties } from './types.js';

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY_MS = 2000;
const DEFAULT_RATE_LIMIT_MS = 1500;

/**
 * Fetch with automatic retry on failure.
 * Respects rate limiting by waiting between retries.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = DEFAULT_RETRY_COUNT,
  delayMs: number = DEFAULT_RETRY_DELAY_MS
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        redirect: 'follow',
        headers: {
          'User-Agent': 'xOTA-Map-Import/1.0 (https://xotamap.oeradio.at)',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 429) {
        // Rate limited — wait longer
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : delayMs * 2;
        console.warn(`  Rate limited on ${url}, waiting ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
      }

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        console.warn(`  Attempt ${attempt + 1} failed for ${url}: ${lastError.message}. Retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${retries} retries`);
}

/**
 * Sleep for the specified number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rate limiter: ensures minimum delay between consecutive calls.
 */
export function createRateLimiter(minIntervalMs: number = DEFAULT_RATE_LIMIT_MS) {
  let lastCallTime = 0;

  return async function rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastCallTime;
    if (elapsed < minIntervalMs) {
      await sleep(minIntervalMs - elapsed);
    }
    lastCallTime = Date.now();
  };
}

/**
 * Create a GeoJSON Point feature from reference properties and coordinates.
 */
export function createFeature(
  lon: number,
  lat: number,
  properties: ReferenceProperties
): ReferenceFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lon, lat],
    },
    properties,
  };
}

/**
 * Wrap an array of features into a GeoJSON FeatureCollection.
 */
export function createFeatureCollection(
  features: ReferenceFeature[]
): ReferenceFeatureCollection {
  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Validate that coordinates are within valid ranges.
 */
export function isValidCoordinate(lon: number, lat: number): boolean {
  return (
    typeof lon === 'number' &&
    typeof lat === 'number' &&
    !isNaN(lon) &&
    !isNaN(lat) &&
    lon >= -180 &&
    lon <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Parse a numeric value safely, returning undefined if invalid.
 */
export function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

/**
 * Format a count with thousands separator for logging.
 */
export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Log a section header for progress output.
 */
export function logSection(program: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Importing: ${program}`);
  console.log(`${'='.repeat(60)}`);
}
