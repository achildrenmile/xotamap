import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSpots, canRequest, _resetRateLimit, SpotholeError } from './spothole';
import type { Spot } from '@/types/spot';

// ---------------------------------------------------------------------------
// Mock data matching the real Spothole API v1 response format
// ---------------------------------------------------------------------------

const MOCK_RAW_SPOT = {
  id: 'abc123def456',
  dx_call: 'OE5JFE/P',
  dx_name: 'Josef',
  dx_qth: 'SOTA OE/OO-001 Dachstein',
  dx_country: 'Austria',
  dx_flag: '',
  dx_continent: 'EU',
  dx_dxcc_id: 206,
  dx_cq_zone: 15,
  dx_itu_zone: 28,
  dx_ssid: null,
  dx_grid: 'JN67wt',
  dx_latitude: 47.475,
  dx_longitude: 13.606,
  dx_location_source: 'SIG REF LOOKUP',
  dx_location_good: true,
  de_call: 'DL2ABC',
  de_country: 'Fed. Rep. of Germany',
  de_flag: '',
  de_continent: 'EU',
  de_dxcc_id: 230,
  de_ssid: null,
  de_grid: 'JO31',
  de_latitude: 51.0,
  de_longitude: 7.0,
  mode: 'CW',
  mode_type: 'CW',
  mode_source: 'SPOT',
  freq: 7032000,
  band: '40m',
  time: 1700000000,
  time_iso: '2023-11-14T22:13:20+00:00',
  received_time: 1700000005,
  received_time_iso: '2023-11-14T22:13:25+00:00',
  comment: '559 in DL',
  sig: 'SOTA',
  sig_refs: [
    {
      id: 'OE/OO-001',
      sig: 'SOTA',
      name: 'Dachstein',
      url: 'https://summits.sota.org.uk/summit/OE/OO-001',
      latitude: 47.475,
      longitude: 13.606,
      grid: 'JN67wt',
      activation_score: 10,
    },
  ],
  source: 'SOTAWATCH',
  source_id: 12345,
  qrt: false,
};

const MOCK_RAW_SPOT_POTA = {
  id: 'xyz789',
  dx_call: 'W1AW',
  dx_name: null,
  dx_qth: null,
  dx_country: 'United States',
  dx_flag: '',
  dx_continent: 'NA',
  dx_dxcc_id: 291,
  dx_cq_zone: 5,
  dx_itu_zone: 8,
  dx_ssid: null,
  dx_grid: 'FN31',
  dx_latitude: 41.714775,
  dx_longitude: -72.727260,
  dx_location_source: 'SIG REF LOOKUP',
  dx_location_good: true,
  de_call: 'K1ABC',
  de_country: 'United States',
  de_flag: '',
  de_continent: 'NA',
  de_dxcc_id: 291,
  de_ssid: null,
  de_grid: null,
  de_latitude: null,
  de_longitude: null,
  mode: 'SSB',
  mode_type: 'PHONE',
  mode_source: 'SPOT',
  freq: 14250000,
  band: '20m',
  time: 1700000100,
  time_iso: '2023-11-14T22:15:00+00:00',
  received_time: 1700000105,
  received_time_iso: '2023-11-14T22:15:05+00:00',
  comment: '',
  sig: 'POTA',
  sig_refs: [
    {
      id: 'US-0001',
      sig: 'POTA',
      name: 'Yellowstone National Park',
      url: 'https://pota.app/#/park/US-0001',
      latitude: 44.4280,
      longitude: -110.5885,
      grid: 'DN44',
      activation_score: null,
    },
  ],
  source: 'POTA',
  source_id: 99999,
  qrt: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('spothole service', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    _resetRateLimit();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('normalizes a SOTA spot correctly', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [MOCK_RAW_SPOT],
    });

    const spots = await fetchSpots({ needsSig: true });
    expect(spots).toHaveLength(1);

    const spot: Spot = spots[0];
    expect(spot.id).toBe('abc123def456');
    expect(spot.callsign).toBe('OE5JFE/P');
    expect(spot.name).toBe('Josef');
    expect(spot.frequency).toBe(7032000);
    expect(spot.band).toBe('40m');
    expect(spot.mode).toBe('CW');
    expect(spot.modeType).toBe('CW');
    expect(spot.reference).toBe('OE/OO-001');
    expect(spot.referenceName).toBe('Dachstein');
    expect(spot.program).toBe('SOTA');
    expect(spot.programCode).toBe('SOTA');
    expect(spot.lat).toBe(47.475);
    expect(spot.lon).toBe(13.606);
    expect(spot.locationGood).toBe(true);
    expect(spot.grid).toBe('JN67wt');
    expect(spot.comment).toBe('559 in DL');
    expect(spot.time).toBe('2023-11-14T22:13:20+00:00');
    expect(spot.timeUnix).toBe(1700000000);
    expect(spot.spotter).toBe('DL2ABC');
    expect(spot.source).toBe('SOTAWATCH');
    expect(spot.country).toBe('Austria');
    expect(spot.continent).toBe('EU');
    expect(spot.qrt).toBe(false);
    expect(spot.sigRefs).toHaveLength(1);
    expect(spot.sigRefs[0].activationScore).toBe(10);
  });

  it('sorts spots newest first', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [MOCK_RAW_SPOT, MOCK_RAW_SPOT_POTA],
    });

    const spots = await fetchSpots();
    // POTA spot has time 1700000100, SOTA has 1700000000
    expect(spots[0].programCode).toBe('POTA');
    expect(spots[1].programCode).toBe('SOTA');
  });

  it('builds query parameters correctly', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await fetchSpots({
      limit: 50,
      maxAge: 3600,
      needsSig: true,
      needsGoodLocation: true,
      sigs: ['SOTA', 'POTA'],
      bands: ['20m', '40m'],
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=50');
    expect(calledUrl).toContain('max_age=3600');
    expect(calledUrl).toContain('needs_sig=true');
    expect(calledUrl).toContain('needs_good_location=true');
    expect(calledUrl).toContain('sig=SOTA%2CPOTA');
    expect(calledUrl).toContain('band=20m%2C40m');
  });

  it('throws SpotholeError on HTTP error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    try {
      await fetchSpots();
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(SpotholeError);
      expect((err as SpotholeError).message).toContain('HTTP 500');
      expect((err as SpotholeError).status).toBe(500);
    }
  });

  it('throws SpotholeError on invalid JSON', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => { throw new SyntaxError('Unexpected token'); },
    });

    await expect(fetchSpots()).rejects.toThrow('Failed to parse JSON');
  });

  it('throws SpotholeError when rate limited', async () => {
    vi.useFakeTimers();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // First call succeeds
    await fetchSpots();

    // Second call should be rate limited
    await expect(fetchSpots()).rejects.toThrow('Rate limited');
    expect(canRequest()).toBe(false);

    // Advance time past rate limit
    vi.advanceTimersByTime(61_000);
    expect(canRequest()).toBe(true);

    vi.useRealTimers();
  });

  it('handles spots with null/missing optional fields', async () => {
    const minimalSpot = {
      id: 'minimal1',
      dx_call: 'TEST/P',
      dx_name: null,
      dx_country: null,
      dx_continent: null,
      dx_grid: null,
      dx_latitude: null,
      dx_longitude: null,
      dx_location_good: false,
      de_call: null,
      mode: null,
      mode_type: null,
      freq: 14074000,
      band: null,
      time: 1700000000,
      time_iso: '2023-11-14T22:13:20+00:00',
      comment: null,
      sig: null,
      sig_refs: [],
      source: 'CLUSTER',
      qrt: false,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [minimalSpot],
    });

    const spots = await fetchSpots();
    expect(spots).toHaveLength(1);
    expect(spots[0].name).toBeUndefined();
    expect(spots[0].lat).toBeUndefined();
    expect(spots[0].lon).toBeUndefined();
    expect(spots[0].reference).toBeUndefined();
    expect(spots[0].programCode).toBe('UNKNOWN');
    expect(spots[0].mode).toBe('');
    expect(spots[0].band).toBe('');
    expect(spots[0].sigRefs).toHaveLength(0);
  });
});
