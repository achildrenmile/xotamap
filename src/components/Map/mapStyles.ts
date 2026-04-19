import type {
  RequestParameters,
  ResourceType,
  StyleSpecification,
} from 'maplibre-gl';

const OPENFREEMAP_BASE = 'https://tiles.openfreemap.org';
const PROXY_BASE = '/tiles';

/**
 * Whether we're running behind the nginx proxy (production) or direct (dev).
 * In production the /tiles/ path is proxied to tiles.openfreemap.org.
 */
const useProxy = import.meta.env.PROD;

/**
 * Return the style URL for a given style name.
 */
function styleUrl(name: string): string {
  const base = useProxy ? PROXY_BASE : OPENFREEMAP_BASE;
  return `${base}/styles/${name}`;
}

export type BasemapStyle = 'standard' | 'outdoor' | 'dark';

/**
 * Get the MapLibre style spec URL for the current theme.
 * - light: "liberty"
 * - dark: "dark"
 */
export function getMapStyleUrl(darkMode: boolean): string {
  return styleUrl(darkMode ? 'dark' : 'liberty');
}

/**
 * Get the MapLibre style spec URL for a named basemap style.
 * - standard: "liberty"
 * - outdoor: "bright"
 * - dark: "dark"
 */
export function getBasemapStyleUrl(style: BasemapStyle): string {
  switch (style) {
    case 'standard':
      return styleUrl('liberty');
    case 'outdoor':
      return styleUrl('bright');
    case 'dark':
      return styleUrl('dark');
  }
}

/**
 * transformRequest callback for MapLibre that rewrites tile.openfreemap.org
 * URLs through the local /tiles/ proxy in production builds.
 */
export function transformRequest(
  url: string,
  _resourceType?: ResourceType,
): RequestParameters | undefined {
  if (useProxy && url.startsWith(OPENFREEMAP_BASE)) {
    return { url: url.replace(OPENFREEMAP_BASE, PROXY_BASE) };
  }
  return undefined;
}

/**
 * Rewrite all OpenFreeMap URLs in a style spec to go through the proxy.
 */
function rewriteStyleUrls(style: StyleSpecification): StyleSpecification {
  if (style.sprite && typeof style.sprite === 'string') {
    style.sprite = style.sprite.replace(OPENFREEMAP_BASE, PROXY_BASE);
  }
  if (style.glyphs) {
    style.glyphs = style.glyphs.replace(OPENFREEMAP_BASE, PROXY_BASE);
  }
  if (style.sources) {
    for (const source of Object.values(style.sources)) {
      if ('url' in source && typeof source.url === 'string') {
        source.url = source.url.replace(OPENFREEMAP_BASE, PROXY_BASE);
      }
      if ('tiles' in source && Array.isArray(source.tiles)) {
        source.tiles = source.tiles.map((t: string) =>
          t.replace(OPENFREEMAP_BASE, PROXY_BASE),
        );
      }
    }
  }
  return style;
}

/**
 * Fetch the style JSON and rewrite URLs for proxy use.
 * Falls back to returning the style URL directly if fetch fails.
 */
export async function getMapStyle(
  darkMode: boolean,
): Promise<string | StyleSpecification> {
  if (!useProxy) {
    return getMapStyleUrl(darkMode);
  }
  try {
    const res = await fetch(getMapStyleUrl(darkMode));
    const style: StyleSpecification = await res.json();
    return rewriteStyleUrls(style);
  } catch {
    return getMapStyleUrl(darkMode);
  }
}

/**
 * Fetch the style JSON for a named basemap, rewriting URLs for proxy use.
 */
export async function getBasemapStyle(
  style: BasemapStyle,
): Promise<string | StyleSpecification> {
  const url = getBasemapStyleUrl(style);
  if (!useProxy) {
    return url;
  }
  try {
    const res = await fetch(url);
    const styleSpec: StyleSpecification = await res.json();
    return rewriteStyleUrls(styleSpec);
  } catch {
    return url;
  }
}
