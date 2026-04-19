import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useI18n } from '../../i18n';

const SOURCE_ID = 'user-location';
const LAYER_ID = 'user-location-dot';
const LAYER_PULSE_ID = 'user-location-pulse';

interface LocationMarkerProps {
  map: maplibregl.Map;
}

/**
 * Adds a "Locate me" button on the map. When clicked, obtains the user's GPS
 * position, flies to it, and renders a blue pulsing dot using MapLibre sources.
 */
export function LocationMarker({ map }: LocationMarkerProps) {
  const { t } = useI18n();
  const { position, error, loading, locate } = useGeolocation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Add custom control button to the map
  useEffect(() => {
    if (!map) return;

    // Build a minimal MapLibre IControl
    const control: maplibregl.IControl = {
      onAdd() {
        const div = document.createElement('div');
        div.className =
          'maplibregl-ctrl maplibregl-ctrl-group';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.title = t.locateMe;
        btn.setAttribute('aria-label', t.locateMe);
        btn.className = 'maplibregl-ctrl-icon xota-locate-btn';
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>`;
        btn.addEventListener('click', () => locate());
        div.appendChild(btn);
        containerRef.current = div;
        return div;
      },
      onRemove() {
        containerRef.current?.remove();
        containerRef.current = null;
      },
    };

    map.addControl(control, 'top-right');

    return () => {
      try {
        map.removeControl(control);
      } catch {
        // Control may already be removed
      }
    };
    // Only run on mount/unmount — locate ref is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update button appearance when loading/error state changes
  useEffect(() => {
    const btn = containerRef.current?.querySelector('button');
    if (!btn) return;
    if (loading) {
      btn.style.opacity = '0.6';
      btn.style.cursor = 'wait';
    } else {
      btn.style.opacity = '';
      btn.style.cursor = '';
    }
    if (error) {
      btn.style.color = '#ef4444';
      btn.title =
        error === 'permission_denied' ? t.locationDenied : t.locationError;
    } else {
      btn.style.color = '';
      btn.title = t.locateMe;
    }
  }, [loading, error, t]);

  // Render pulsing dot and fly-to when position changes
  useEffect(() => {
    if (!position || !map) return;

    const { lat, lng } = position;

    function addMarker() {
      const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: {},
          },
        ],
      };

      // Remove existing layers/source if present
      try {
        if (map.getLayer(LAYER_PULSE_ID)) map.removeLayer(LAYER_PULSE_ID);
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // Ignore
      }

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: geojson,
      });

      // Outer pulse ring
      map.addLayer({
        id: LAYER_PULSE_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': 18,
          'circle-color': '#3b82f6',
          'circle-opacity': 0.25,
          'circle-stroke-width': 0,
        },
      });

      // Inner blue dot
      map.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': 8,
          'circle-color': '#3b82f6',
          'circle-opacity': 0.9,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      // Animate the pulse ring via a simple requestAnimationFrame loop
      let frame: number;
      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) % 2000; // 2-second cycle
        const progress = elapsed / 2000;
        const radius = 8 + progress * 20;
        const opacity = 0.4 * (1 - progress);
        try {
          map.setPaintProperty(LAYER_PULSE_ID, 'circle-radius', radius);
          map.setPaintProperty(LAYER_PULSE_ID, 'circle-opacity', opacity);
        } catch {
          return; // Map or layer gone
        }
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);

      // Store cancel function on the source element for cleanup
      return () => {
        cancelAnimationFrame(frame);
        try {
          if (map.getLayer(LAYER_PULSE_ID)) map.removeLayer(LAYER_PULSE_ID);
          if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
          if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
        } catch {
          // Ignore
        }
      };
    }

    let cleanup: (() => void) | undefined;

    if (map.isStyleLoaded()) {
      cleanup = addMarker();
    } else {
      map.once('load', () => {
        cleanup = addMarker();
      });
    }

    // Fly to location
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 12) });

    return () => {
      cleanup?.();
    };
  }, [map, position]);

  return null;
}
