import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import type { MapGeoJSONFeature } from 'maplibre-gl';
import type { Translations } from '../../i18n/translations';

interface ReferencePopupProps {
  map: maplibregl.Map;
  /** Layer IDs to listen for click events on */
  layerIds: string[];
  /** i18n translations object */
  t: Translations;
}

/**
 * Build a deep link to the specific reference page for a program.
 * Returns null if no deep link pattern is known.
 */
function buildReferenceUrl(program: string, refCode: string): string | null {
  switch (program.toLowerCase()) {
    case 'sota':
      return `https://sotl.as/summits/${refCode}`;
    case 'pota':
      return `https://pota.app/#/park/${refCode}`;
    case 'wwff':
      return `https://wwff.co/directory/?showRef=${refCode}`;
    case 'gma':
    case 'hema':
    case 'wca':
    case 'wlota':
    case 'eca':
    case 'ela':
    case 'mota':
    case 'arlhs':
    case 'illw':
      return 'https://www.cqgma.org';
    case 'iota':
      return `https://www.iota-world.org/islands/?grpRef=${refCode}`;
    case 'wwbota':
      return `https://wwbota.net/map/`;
    case 'tota':
      return `https://wwtota.com/seznam/?ref=${refCode}`;
    case 'bota':
      return `https://bfrg.at/bota`;
    case 'krmnpa':
      return `https://parksnpeaks.org/park.php?park=${refCode}`;
    case 'wab':
      return `https://wab.org.uk`;
    case 'zlota':
      return `https://ontheair.nz`;
    case 'siota':
      return `https://silosontheair.com`;
    case 'wota':
      return `https://wota.org.uk`;
    case 'hota-uk':
      return `https://hota.org.uk`;
    case 'llota':
      return `https://www.outnaboot.ca/llota/`;
    case 'cota-oe':
      return `http://www.afch.at/cota/`;
    case 'scota':
      return `https://scota.us`;
    case 'biwota':
      return `https://www.nharg.org.uk/biwota`;
    default:
      return null;
  }
}

/**
 * Build popup HTML for a single reference entry (used inside multi-feature popup).
 */
function buildEntryHTML(
  feature: MapGeoJSONFeature,
  program: string,
  t: Translations,
): string {
  const props = feature.properties || {};

  const refCode =
    props.reference || props.ref || props.code || props.id || '';
  const name = props.name || props.summit_name || props.park_name || '';
  const altitude = props.altitude || props.elevation || props.alt || '';
  const points = props.points || props.score || '';
  const programCode = program.toUpperCase();

  const programs = props.programs
    ? String(props.programs)
    : programCode;

  let html = `<div class="xota-popup-title">${escapeHtml(refCode)}`;
  if (name) {
    html += ` &mdash; ${escapeHtml(name)}`;
  }
  html += '</div>';

  html += '<div class="xota-popup-details">';
  html += `<div class="xota-popup-row"><span class="xota-popup-label">${escapeHtml(t.popupProgramme)}:</span> <span>${escapeHtml(programs)}</span></div>`;

  if (altitude) {
    html += `<div class="xota-popup-row"><span class="xota-popup-label">${escapeHtml(t.popupAltitude)}:</span> <span>${escapeHtml(String(altitude))}m</span>`;
    if (points) {
      html += ` &nbsp;|&nbsp; <span class="xota-popup-label">${escapeHtml(t.popupPoints)}:</span> <span>${escapeHtml(String(points))}</span>`;
    }
    html += '</div>';
  } else if (points) {
    html += `<div class="xota-popup-row"><span class="xota-popup-label">${escapeHtml(t.popupPoints)}:</span> <span>${escapeHtml(String(points))}</span></div>`;
  }

  html += '</div>';

  html += '<div class="xota-popup-links">';
  const deepLink = buildReferenceUrl(program, refCode);
  if (deepLink) {
    html += `<a href="${deepLink}" target="_blank" rel="noopener noreferrer" class="xota-popup-link">&rarr; ${escapeHtml(refCode)} @ ${escapeHtml(programCode)}</a>`;
  }
  html += `<a href="/encyclopedia/${encodeURIComponent(program.toLowerCase())}" class="xota-popup-link">&rarr; ${escapeHtml(t.popupEncyclopedia)}</a>`;
  html += '</div>';

  return html;
}

/**
 * Build popup HTML for one or more overlapping reference features.
 * Deduplicates by program+refCode so the same reference isn't shown twice.
 */
function buildPopupHTML(
  features: MapGeoJSONFeature[],
  t: Translations,
): string {
  // Deduplicate by program + refCode
  const seen = new Set<string>();
  const unique: { feature: MapGeoJSONFeature; program: string }[] = [];
  for (const f of features) {
    const program = programFromLayerId(f.layer.id);
    const props = f.properties || {};
    const refCode = props.reference || props.ref || props.code || props.id || '';
    const key = `${program}:${refCode}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ feature: f, program });
    }
  }

  let html = '<div class="xota-popup">';
  for (let i = 0; i < unique.length; i++) {
    if (i > 0) {
      html += '<div class="xota-popup-separator"></div>';
    }
    html += buildEntryHTML(unique[i].feature, unique[i].program, t);
  }
  html += '</div>';
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Extract the program code from a layer ID.
 * Layer IDs follow the pattern `ref-{program}-circles`.
 */
function programFromLayerId(layerId: string): string {
  const match = layerId.match(/^ref-(.+)-circles$/);
  return match ? match[1] : layerId;
}

/**
 * Manages MapLibre popups for reference layer clicks.
 * Renders as a headless component (returns null).
 */
export function ReferencePopup({ map, layerIds, t }: ReferencePopupProps) {
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const handleClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      // Query features at the click point across all reference layers
      const existingLayers = layerIds.filter((id) => {
        try {
          return !!map.getLayer(id);
        } catch {
          return false;
        }
      });

      if (existingLayers.length === 0) return;

      // Use a bounding box around the click point to catch nearby overlapping
      // features — especially important on mobile where touch targets are imprecise
      const tolerance = 'ontouchstart' in window ? 20 : 5;
      const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
        [e.point.x - tolerance, e.point.y - tolerance],
        [e.point.x + tolerance, e.point.y + tolerance],
      ];
      const features = map.queryRenderedFeatures(bbox, {
        layers: existingLayers,
      });

      if (!features || features.length === 0) return;

      // Get coordinates from first feature or click point
      let lng = e.lngLat.lng;
      let lat = e.lngLat.lat;
      const geom = features[0].geometry;
      if (geom.type === 'Point') {
        [lng, lat] = geom.coordinates as [number, number];
      }

      // Remove existing popup
      if (popupRef.current) {
        popupRef.current.remove();
      }

      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '320px',
        className: 'xota-reference-popup',
      })
        .setLngLat([lng, lat])
        .setHTML(buildPopupHTML(features, t))
        .addTo(map);

      popupRef.current = popup;
    },
    [map, layerIds, t],
  );

  useEffect(() => {
    if (!map) return;

    // Add click handler on map (not on individual layers, to handle dynamic layers)
    map.on('click', handleClick);

    // Change cursor on hover over reference layers
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // Attach hover handlers to each layer
    const attachedLayers: string[] = [];
    const attachHover = () => {
      for (const layerId of layerIds) {
        try {
          if (map.getLayer(layerId) && !attachedLayers.includes(layerId)) {
            map.on('mouseenter', layerId, handleMouseEnter);
            map.on('mouseleave', layerId, handleMouseLeave);
            attachedLayers.push(layerId);
          }
        } catch {
          // Layer may not exist yet
        }
      }
    };

    // Attach now and also when new layers are added
    attachHover();
    map.on('sourcedata', attachHover);

    return () => {
      map.off('click', handleClick);
      map.off('sourcedata', attachHover);
      for (const layerId of attachedLayers) {
        try {
          map.off('mouseenter', layerId, handleMouseEnter);
          map.off('mouseleave', layerId, handleMouseLeave);
        } catch {
          // Ignore
        }
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [map, layerIds, handleClick]);

  return null;
}
