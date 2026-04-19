export interface GeocodingResult {
  displayName: string;
  lat: number;
  lon: number;
  type: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'xOTAMap/1.0 (kontakt@oeradio.at)';

/** Minimum time between requests in ms (Nominatim policy: max 1 req/s) */
const MIN_REQUEST_INTERVAL = 1100;
let lastRequestTime = 0;

/**
 * Search for a location using the Nominatim (OpenStreetMap) geocoding API.
 * Rate-limited to at most 1 request per second per Nominatim usage policy.
 *
 * Debouncing is handled by the caller.
 */
export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];

  // Rate limiting: wait if last request was too recent
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '0',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const data = await response.json();

  return (data as Array<{
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    class: string;
  }>).map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    type: item.type || item.class || 'place',
  }));
}
