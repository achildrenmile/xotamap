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

/** Known program websites for building official page links */
const PROGRAM_WEBSITES: Record<string, string> = {
  sota: 'https://www.sota.org.uk',
  pota: 'https://pota.app',
  wwff: 'https://wwff.co',
  gma: 'https://www.cqgma.org',
  iota: 'https://www.iota-world.org',
  cota: 'https://cota.cc',
  lota: 'https://www.lota.cc',
  bota: 'https://bfrg.at/bota',
  slota: 'https://slota.hamradio.si',
  hema: 'https://hfrg.at/hema',
};

/**
 * Build popup HTML for a clicked reference feature.
 */
function buildPopupHTML(
  feature: MapGeoJSONFeature,
  program: string,
  t: Translations,
): string {
  const props = feature.properties || {};

  // Try common property names for reference code and name
  const refCode =
    props.reference || props.ref || props.code || props.id || '';
  const name = props.name || props.summit_name || props.park_name || '';
  const altitude = props.altitude || props.elevation || props.alt || '';
  const points = props.points || props.score || '';
  const programCode = program.toUpperCase();

  // Build programs line — the feature may belong to multiple programs
  const programs = props.programs
    ? String(props.programs)
    : programCode;

  // Title line
  let html = '<div class="xota-popup">';
  html += `<div class="xota-popup-title">${escapeHtml(refCode)}`;
  if (name) {
    html += ` &mdash; ${escapeHtml(name)}`;
  }
  html += '</div>';

  // Separator
  html += '<div class="xota-popup-separator"></div>';

  // Details
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

  // Links
  html += '<div class="xota-popup-links">';

  const website = PROGRAM_WEBSITES[program.toLowerCase()];
  if (website) {
    html += `<a href="${website}" target="_blank" rel="noopener noreferrer" class="xota-popup-link">&rarr; ${escapeHtml(t.popupOfficialPage)}</a>`;
  }

  html += `<a href="/encyclopedia/${encodeURIComponent(program.toLowerCase())}" class="xota-popup-link">&rarr; ${escapeHtml(t.popupEncyclopedia)}</a>`;

  html += '</div>';
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

      const features = map.queryRenderedFeatures(e.point, {
        layers: existingLayers,
      });

      if (!features || features.length === 0) return;

      const feature = features[0];
      const program = programFromLayerId(feature.layer.id);

      // Get coordinates — for point features use geometry, otherwise click point
      let lng = e.lngLat.lng;
      let lat = e.lngLat.lat;
      const geom = feature.geometry;
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
        .setHTML(buildPopupHTML(feature, program, t))
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
