import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { getMapStyle, transformRequest } from './mapStyles';

export interface MapViewState {
  center: [number, number];
  zoom: number;
}

const DEFAULT_VIEW: MapViewState = {
  center: [13.3, 47.5], // Austria / Central Europe
  zoom: 6,
};

/**
 * Custom hook that creates and manages a MapLibre GL JS map instance.
 */
export function useMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  initialView: MapViewState = DEFAULT_VIEW,
  darkMode: boolean = false,
) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  // Create map on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Capture non-null container for use inside async closure
    const el: HTMLDivElement = container;
    let cancelled = false;

    async function init() {
      const style = await getMapStyle(darkMode);
      if (cancelled) return;

      const mapInstance = new maplibregl.Map({
        container: el,
        style,
        center: initialView.center,
        zoom: initialView.zoom,
        transformRequest,
        attributionControl: false,
      });

      // Navigation controls (zoom +/-, compass)
      mapInstance.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        'top-right',
      );

      // Geolocation control
      mapInstance.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
        }),
        'top-right',
      );

      mapRef.current = mapInstance;
      setMap(mapInstance);
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMap(null);
      }
    };
    // We intentionally only run this on mount/unmount and darkMode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode]);

  // Update style when darkMode changes without recreating the map
  // (handled by the effect above recreating the map)

  return map;
}
