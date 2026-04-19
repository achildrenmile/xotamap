/**
 * T29 — SpotLayer
 *
 * Renders live spots as GeoJSON circle markers on the MapLibre map.
 * Spots are displayed above reference layers using a high z-order layer.
 *
 * Features:
 * - Fresh spots (< 5 min) get a pulsing ring animation
 * - Click → SpotPopup
 * - Different colour/shape from reference markers (orange/red)
 * - Filter state from T28 applied before rendering
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import type { Spot } from '../../types/spot';
import { useSpotPopup } from './SpotPopup';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_ID = 'spots-source';
const LAYER_ID = 'spots-circles';
const PULSE_LAYER_ID = 'spots-pulse';

/** Spots newer than this are considered "fresh" and get a pulse ring */
const FRESH_THRESHOLD_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type GeoJSONFeatureCollection = import('geojson').FeatureCollection;

function spotsToGeoJSON(spots: Spot[]): GeoJSONFeatureCollection {
  const nowMs = Date.now();
  return {
    type: 'FeatureCollection',
    features: spots
      .filter((s) => s.lat !== undefined && s.lon !== undefined && s.locationGood)
      .map((s) => {
        const ageMs = nowMs - s.timeUnix * 1000;
        const isFresh = ageMs < FRESH_THRESHOLD_MS;
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [s.lon!, s.lat!],
          },
          properties: {
            id: s.id,
            callsign: s.callsign,
            frequency: s.frequency,
            mode: s.mode,
            reference: s.reference ?? null,
            referenceUrl: s.referenceUrl ?? null,
            programCode: s.programCode,
            timeUnix: s.timeUnix,
            comment: s.comment ?? null,
            isFresh: isFresh ? 1 : 0,
          },
        };
      }),
  };
}

// ---------------------------------------------------------------------------
// SpotLayer component
// ---------------------------------------------------------------------------

interface SpotLayerProps {
  map: maplibregl.Map;
  spots: Spot[];
}

export function SpotLayer({ map, spots }: SpotLayerProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  // Keep a ref to the full spot list for click-lookup by ID
  const spotsRef = useRef<Spot[]>(spots);
  spotsRef.current = spots;

  const handlePopupClose = useCallback(() => setSelectedSpot(null), []);

  useSpotPopup({ map, spot: selectedSpot, onClose: handlePopupClose });

  // Setup sources and layers on mount
  useEffect(() => {
    if (!map) return;

    const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

    function addLayers() {
      // Pulse ring layer (fresh spots only)
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: empty,
        });
      }

      // Pulse ring (below the solid circle, only fresh spots)
      if (!map.getLayer(PULSE_LAYER_ID)) {
        map.addLayer({
          id: PULSE_LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          filter: ['==', ['get', 'isFresh'], 1],
          paint: {
            'circle-color': 'transparent',
            'circle-stroke-color': '#f97316', // orange-500
            'circle-stroke-width': 2,
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              4, 8, 8, 14, 12, 20,
            ],
            'circle-opacity': 0.6,
            'circle-stroke-opacity': 0.7,
          },
        });
      }

      // Main spot circles
      if (!map.getLayer(LAYER_ID)) {
        map.addLayer({
          id: LAYER_ID,
          type: 'circle',
          source: SOURCE_ID,
          paint: {
            'circle-color': [
              'case',
              ['==', ['get', 'isFresh'], 1],
              '#f97316', // orange for fresh
              '#ef4444',  // red for older
            ],
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              4, 4, 8, 7, 12, 10, 16, 14,
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.5,
            'circle-opacity': 0.92,
          },
        });
      }

      // Click handler
      map.on('click', LAYER_ID, handleClick);
      map.on('mouseenter', LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', LAYER_ID, () => { map.getCanvas().style.cursor = ''; });
    }

    if (map.isStyleLoaded()) {
      addLayers();
    } else {
      map.on('load', addLayers);
    }

    function handleClick(e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) {
      const feature = e.features?.[0];
      if (!feature) return;
      const id = feature.properties?.id as string | undefined;
      if (!id) return;
      const spot = spotsRef.current.find((s) => s.id === id);
      if (spot) {
        setSelectedSpot(spot);
      }
    }

    return () => {
      map.off('load', addLayers);
      try {
        map.off('click', LAYER_ID, handleClick as Parameters<typeof map.off>[1]);
        if (map.getLayer(PULSE_LAYER_ID)) map.removeLayer(PULSE_LAYER_ID);
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // Map may already be removed
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update GeoJSON data whenever spots change
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource(SOURCE_ID);
    if (src && src.type === 'geojson') {
      (src as maplibregl.GeoJSONSource).setData(spotsToGeoJSON(spots));
    }
  }, [map, spots]);

  return null;
}
