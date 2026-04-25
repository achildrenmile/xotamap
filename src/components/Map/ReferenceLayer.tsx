import { useEffect, useRef } from 'react';
import type maplibregl from 'maplibre-gl';
import { getPMTilesSource } from '../../services/pmtiles';

interface ReferenceLayerProps {
  map: maplibregl.Map;
  program: string;
  color: string;
  visible: boolean;
}

export function sourceId(program: string): string {
  return `ref-${program}`;
}

export function layerId(program: string): string {
  return `ref-${program}-circles`;
}

/**
 * Adds a PMTiles-backed vector circle layer to the map for a given
 * xOTA reference program. Handles source/layer lifecycle and visibility.
 *
 * T17 — Zoom-dependent styling provides a clustering effect:
 *  - zoom < 6:  very small dots (2-3px), high opacity aggregation
 *  - zoom 6-10: medium dots (4-6px)
 *  - zoom > 10: large dots (8-14px) with stroke for clarity
 */
export function ReferenceLayer({ map, program, color, visible }: ReferenceLayerProps) {
  const src = sourceId(program);
  const lyr = layerId(program);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  // Add source and layer on mount, remove on unmount
  useEffect(() => {
    if (!map) return;

    function addLayer() {
      if (map.getSource(src)) return;

      map.addSource(src, getPMTilesSource(program));

      map.addLayer({
        id: lyr,
        type: 'circle',
        source: src,
        'source-layer': program,
        paint: {
          'circle-color': color,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 0.4,
            6, 0.6,
            10, 0.8,
            14, 0.9,
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 1.5,
            6, 3,
            8, 5,
            10, 7,
            12, 10,
            16, 14,
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 0,
            8, 0.5,
            10, 1,
            14, 1.5,
          ],
          'circle-stroke-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 0,
            8, 0.5,
            12, 0.8,
          ],
          'circle-blur': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 0.4,
            8, 0.1,
            12, 0,
          ],
        },
        layout: {
          // Use ref to get current visibility at time of layer creation
          visibility: visibleRef.current ? 'visible' : 'none',
        },
      });
    }

    if (map.isStyleLoaded()) {
      addLayer();
    } else {
      map.on('load', addLayer);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      map.off('load', addLayer);
      try {
        if (map.getLayer(lyr)) map.removeLayer(lyr);
        if (map.getSource(src)) map.removeSource(src);
      } catch {
        // Map may already be removed
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, program, color]);

  // Toggle visibility — also handle style changes that re-create layers
  useEffect(() => {
    if (!map) return;

    const applyVisibility = () => {
      try {
        if (map.getLayer(lyr)) {
          map.setLayoutProperty(lyr, 'visibility', visible ? 'visible' : 'none');
        }
      } catch {
        // Layer may not exist yet
      }
    };

    applyVisibility();
    // Re-apply after style data loads (handles basemap switch race condition)
    map.on('styledata', applyVisibility);

    return () => {
      map.off('styledata', applyVisibility);
    };
  }, [map, lyr, visible]);

  return null;
}
