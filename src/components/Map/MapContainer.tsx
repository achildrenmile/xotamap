import { useRef, type ReactNode } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type maplibregl from 'maplibre-gl';
import { useMap } from './useMap';
import { initPMTiles } from '../../services/pmtiles';

// Register PMTiles protocol once
initPMTiles();

interface MapContainerProps {
  /**
   * Render prop: called with the map instance once it has been created.
   * Receives null while the map is still initialising.
   */
  children?: (map: maplibregl.Map | null) => ReactNode;
}

export function MapContainer({ children }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Always use light mode for the map basemap
  const map = useMap(containerRef, undefined, false);

  return (
    <div className="relative h-full w-full">
      {/* Map canvas */}
      <div ref={containerRef} className="h-full w-full" />
      {/* Overlay children (controls, layers, etc.) */}
      {children?.(map)}
    </div>
  );
}
