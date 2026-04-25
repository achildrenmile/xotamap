/**
 * Spothole API client service.
 *
 * Fetches and normalizes amateur radio spots from the Spothole API (spothole.app).
 * Spothole aggregates spots from 21+ programs (SOTA, POTA, WWFF, etc.) and
 * provides them through a public JSON API (no auth required).
 *
 * API docs: https://spothole.app/apidocs
 * Base URL: https://spothole.app/api/v1
 *
 * NOTE: Spothole may have CORS restrictions for browser requests. If you get
 * CORS errors, you will need to proxy requests through your own server/nginx.
 * A proxy config example:
 *   location /api/spothole/ {
 *     proxy_pass https://spothole.app/api/v1/;
 *   }
 */

import type { Spot, SpotFilters, SigRef } from '@/types/spot';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SPOTHOLE_BASE_URL = import.meta.env.DEV
  ? 'https://spothole.app/api/v1'
  : '/api/spothole';
const REQUEST_TIMEOUT_MS = 10_000;
const MIN_REQUEST_INTERVAL_MS = 60_000; // Rate limit: 1 request per minute

// ---------------------------------------------------------------------------
// Raw Spothole API types (matching their OpenAPI spec v1.2)
// ---------------------------------------------------------------------------

interface RawSigRef {
  id: string;
  sig: string;
  name?: string;
  url?: string;
  latitude?: number;
  longitude?: number;
  grid?: string;
  activation_score?: number | null;
}

interface RawSpot {
  id: string;
  dx_call: string;
  dx_name?: string | null;
  dx_qth?: string | null;
  dx_country?: string | null;
  dx_continent?: string | null;
  dx_grid?: string | null;
  dx_latitude?: number | null;
  dx_longitude?: number | null;
  dx_location_good?: boolean;
  de_call?: string | null;
  mode?: string | null;
  mode_type?: string | null;
  freq: number;
  band?: string | null;
  time: number;
  time_iso: string;
  comment?: string | null;
  sig?: string | null;
  sig_refs?: RawSigRef[];
  source: string;
  qrt?: boolean;
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

let lastRequestTime = 0;

/**
 * Reset the rate limit timer. Exported for testing only.
 * @internal
 */
export function _resetRateLimit(): void {
  lastRequestTime = 0;
}

/**
 * Returns true if enough time has elapsed since the last request.
 * Call this before making a request to respect rate limits.
 */
export function canRequest(): boolean {
  return Date.now() - lastRequestTime >= MIN_REQUEST_INTERVAL_MS;
}

/**
 * Returns milliseconds until the next request is allowed.
 * Returns 0 if a request can be made immediately.
 */
export function msUntilNextRequest(): number {
  const elapsed = Date.now() - lastRequestTime;
  return Math.max(0, MIN_REQUEST_INTERVAL_MS - elapsed);
}

// ---------------------------------------------------------------------------
// Program code normalization
// ---------------------------------------------------------------------------

/**
 * Map Spothole SIG names to our internal program codes.
 * Spothole SIG names already match our codes in most cases.
 * This map handles any discrepancies and provides a canonical mapping.
 */
const SIG_TO_PROGRAM_CODE: Record<string, string> = {
  POTA: 'POTA',
  SOTA: 'SOTA',
  WWFF: 'WWFF',
  WWBOTA: 'WWBOTA',
  GMA: 'GMA',
  HEMA: 'HEMA',
  WCA: 'WCA',
  MOTA: 'MOTA',
  SIOTA: 'SIOTA',
  ARLHS: 'ARLHS',
  ILLW: 'ILLW',
  ZLOTA: 'ZLOTA',
  KRMNPA: 'KRMNPA',
  IOTA: 'IOTA',
  WOTA: 'WOTA',
  BOTA: 'BOTA',
  LLOTA: 'LLOTA',
  WWTOTA: 'WWTOTA',
  WAB: 'WAB',
  WAI: 'WAI',
  TOTA: 'TOTA',
};

function normalizeProgramCode(sig: string | null | undefined): string {
  if (!sig) return 'UNKNOWN';
  return SIG_TO_PROGRAM_CODE[sig] ?? sig;
}

// ---------------------------------------------------------------------------
// Query parameter builder
// ---------------------------------------------------------------------------

function buildQueryParams(filters?: SpotFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters?.limit != null) {
    params.set('limit', String(filters.limit));
  }
  if (filters?.maxAge != null) {
    params.set('max_age', String(filters.maxAge));
  }
  if (filters?.sigs?.length) {
    params.set('sig', filters.sigs.join(','));
  }
  if (filters?.needsSig) {
    params.set('needs_sig', 'true');
  }
  if (filters?.needsSigRef) {
    params.set('needs_sig_ref', 'true');
  }
  if (filters?.needsGoodLocation) {
    params.set('needs_good_location', 'true');
  }
  if (filters?.bands?.length) {
    params.set('band', filters.bands.join(','));
  }
  if (filters?.modes?.length) {
    params.set('mode', filters.modes.join(','));
  }
  if (filters?.modeTypes?.length) {
    params.set('mode_type', filters.modeTypes.join(','));
  }
  if (filters?.dxCallIncludes) {
    params.set('dx_call_includes', filters.dxCallIncludes);
  }
  if (filters?.dxContinents?.length) {
    params.set('dx_continent', filters.dxContinents.join(','));
  }
  if (filters?.dedupe) {
    params.set('dedupe', 'true');
  }
  if (filters?.allowQrt != null) {
    params.set('allow_qrt', String(filters.allowQrt));
  }

  return params;
}

// ---------------------------------------------------------------------------
// Response normalization
// ---------------------------------------------------------------------------

function normalizeSigRef(raw: RawSigRef): SigRef {
  return {
    id: raw.id,
    sig: raw.sig,
    name: raw.name ?? undefined,
    url: raw.url ?? undefined,
    lat: raw.latitude ?? undefined,
    lon: raw.longitude ?? undefined,
    grid: raw.grid ?? undefined,
    activationScore: raw.activation_score ?? undefined,
  };
}

function normalizeSpot(raw: RawSpot): Spot {
  const sigRefs = (raw.sig_refs ?? []).map(normalizeSigRef);
  const primaryRef = sigRefs[0];

  return {
    id: raw.id,
    callsign: raw.dx_call,
    name: raw.dx_name ?? undefined,
    frequency: raw.freq,
    band: raw.band ?? '',
    mode: raw.mode ?? '',
    modeType: raw.mode_type ?? undefined,
    reference: primaryRef?.id,
    referenceName: primaryRef?.name,
    referenceUrl: primaryRef?.url,
    program: raw.sig ?? '',
    programCode: normalizeProgramCode(raw.sig),
    sigRefs,
    lat: raw.dx_latitude ?? undefined,
    lon: raw.dx_longitude ?? undefined,
    locationGood: raw.dx_location_good ?? false,
    grid: raw.dx_grid ?? undefined,
    comment: raw.comment ?? undefined,
    time: raw.time_iso,
    timeUnix: raw.time,
    spotter: raw.de_call ?? undefined,
    source: raw.source,
    country: raw.dx_country ?? undefined,
    continent: raw.dx_continent ?? undefined,
    qrt: raw.qrt ?? false,
  };
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class SpotholeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SpotholeError';
  }
}

// ---------------------------------------------------------------------------
// Main fetch function
// ---------------------------------------------------------------------------

/**
 * Fetch spots from the Spothole API and normalize them to our Spot interface.
 *
 * Results are sorted by time (newest first).
 *
 * @param filters - Optional filters to narrow down the results
 * @returns Array of normalized Spot objects
 * @throws SpotholeError on network, HTTP, parse, or rate-limit errors
 *
 * @example
 * ```ts
 * // Fetch latest xOTA spots with good map locations
 * const spots = await fetchSpots({
 *   needsSig: true,
 *   needsGoodLocation: true,
 *   limit: 200,
 *   maxAge: 3600,
 * });
 * ```
 */
export async function fetchSpots(filters?: SpotFilters): Promise<Spot[] | null> {
  // Rate limit check — silently return null instead of throwing
  if (!canRequest()) {
    return null;
  }

  const params = buildQueryParams(filters);
  const url = `${SPOTHOLE_BASE_URL}/spots${params.toString() ? '?' + params.toString() : ''}`;

  let response: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new SpotholeError('Request timed out after 10s', undefined, err);
    }
    throw new SpotholeError('Network error fetching spots', undefined, err);
  } finally {
    lastRequestTime = Date.now();
  }

  if (!response.ok) {
    throw new SpotholeError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
    );
  }

  let rawSpots: RawSpot[];
  try {
    rawSpots = (await response.json()) as RawSpot[];
  } catch (err: unknown) {
    throw new SpotholeError('Failed to parse JSON response', undefined, err);
  }

  if (!Array.isArray(rawSpots)) {
    throw new SpotholeError('Unexpected response format: expected an array');
  }

  // Normalize and sort by time (newest first)
  const spots = rawSpots.map(normalizeSpot);
  spots.sort((a, b) => b.timeUnix - a.timeUnix);

  return spots;
}
