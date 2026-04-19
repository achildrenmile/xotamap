/**
 * Normalized spot interface for the xOTA Map.
 * Data is sourced from Spothole (spothole.app) and normalized
 * from their API format into our internal representation.
 */
export interface Spot {
  /** Unique identifier (hash from Spothole) */
  id: string;
  /** Callsign of the spotted operator (DX) */
  callsign: string;
  /** Name of the spotted operator, if known */
  name?: string;
  /** Frequency in Hz */
  frequency: number;
  /** Band name, e.g. "40m", "20m" */
  band: string;
  /** Operating mode, e.g. "CW", "SSB", "FT8" */
  mode: string;
  /** Mode family, e.g. "CW", "PHONE", "DIGITAL" */
  modeType?: string;
  /** SIG reference ID, e.g. "OE/OO-001", "GB-0001" */
  reference?: string;
  /** SIG reference name, e.g. "Dachstein" */
  referenceName?: string;
  /** SIG reference URL for lookups */
  referenceUrl?: string;
  /** Program name as returned by Spothole, e.g. "SOTA", "POTA", "WWFF" */
  program: string;
  /** Normalized program code matching our index.json codes */
  programCode: string;
  /** All SIG references for n-fer activations */
  sigRefs: SigRef[];
  /** Latitude of the DX operator */
  lat?: number;
  /** Longitude of the DX operator */
  lon?: number;
  /** Whether the location is considered accurate enough for map display */
  locationGood: boolean;
  /** Maidenhead grid locator */
  grid?: string;
  /** Comment left by the spotter */
  comment?: string;
  /** Time of the spot, ISO 8601 */
  time: string;
  /** Time of the spot as Unix timestamp (seconds) */
  timeUnix: number;
  /** Callsign of the spotter (DE) */
  spotter?: string;
  /** Data source identifier from Spothole */
  source: string;
  /** Country of the DX operator */
  country?: string;
  /** Continent of the DX operator */
  continent?: string;
  /** Whether the operator is known to be QRT */
  qrt: boolean;
}

/** A SIG reference within a spot (supports n-fer activations) */
export interface SigRef {
  /** Reference ID, e.g. "OE/OO-001" */
  id: string;
  /** SIG name, e.g. "SOTA" */
  sig: string;
  /** Reference name, e.g. "Dachstein" */
  name?: string;
  /** URL for more info */
  url?: string;
  /** Latitude of the reference */
  lat?: number;
  /** Longitude of the reference */
  lon?: number;
  /** Maidenhead grid */
  grid?: string;
  /** Activation score (SOTA only) */
  activationScore?: number;
}

/** Filters for the Spothole API query */
export interface SpotFilters {
  /** Maximum number of spots to return */
  limit?: number;
  /** Only spots newer than this many seconds ago */
  maxAge?: number;
  /** Only spots from these SIGs (e.g. ["SOTA", "POTA"]) */
  sigs?: string[];
  /** Only spots that have a SIG (excludes plain DX cluster spots) */
  needsSig?: boolean;
  /** Only spots with a SIG reference */
  needsSigRef?: boolean;
  /** Only spots with good location data (suitable for map display) */
  needsGoodLocation?: boolean;
  /** Only spots on these bands */
  bands?: string[];
  /** Only spots with these modes */
  modes?: string[];
  /** Only spots with these mode types */
  modeTypes?: string[];
  /** DX callsign contains this string */
  dxCallIncludes?: string;
  /** DX on these continents */
  dxContinents?: string[];
  /** Deduplicate by callsign (latest spot per callsign) */
  dedupe?: boolean;
  /** Include QRT spots */
  allowQrt?: boolean;
}
