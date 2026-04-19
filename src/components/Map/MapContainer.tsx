import { useRef, useEffect, useState, type ReactNode } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type maplibregl from 'maplibre-gl';
import { useMap } from './useMap';
import { initPMTiles } from '../../services/pmtiles';

// Register PMTiles protocol once
initPMTiles();

/**
 * Detect whether the browser is currently in dark mode,
 * checking both the Tailwind 'dark' class and the OS preference.
 */
function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

interface MapContainerProps {
  /**
   * Render prop: called with the map instance once it has been created.
   * Receives null while the map is still initialising.
   */
  children?: (map: maplibregl.Map | null) => ReactNode;
}

export function MapContainer({ children }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [darkMode, setDarkMode] = useState(isDarkMode);

  // Watch for dark mode changes (Tailwind toggles the 'dark' class on <html>)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(isDarkMode());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const map = useMap(containerRef, undefined, darkMode);

  return (
    <div className="relative h-full w-full">
      {/* Map canvas */}
      <div ref={containerRef} className="h-full w-full" />
      {/* Overlay children (controls, layers, etc.) */}
      {children?.(map)}
    </div>
  );
}
