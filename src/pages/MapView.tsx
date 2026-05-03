import { useState, useEffect, useMemo, useCallback } from 'react';
import type maplibregl from 'maplibre-gl';
import { MapContainer } from '../components/Map/MapContainer';
import { ReferenceLayer, layerId, sourceId } from '../components/Map/ReferenceLayer';
import { ReferencePopup } from '../components/Map/ReferencePopup';
import { SpotLayer } from '../components/Map/SpotLayer';
import { LayerSwitcher, type ProgramEntry } from '../components/Map/LayerSwitcher';
import { LocationMarker } from '../components/Map/LocationMarker';
import { BasemapSelector } from '../components/Map/BasemapSelector';
import { OverlapFinder } from '../components/Map/OverlapFinder';
import { WhatCountsHere } from '../components/Map/WhatCountsHere';
import { LocationSearch } from '../components/Map/LocationSearch';
import { useLayerVisibility } from '../hooks/useLayerVisibility';
import { useSpotPoller } from '../hooks/useSpotPoller';
import { useSpotFilters } from '../hooks/useSpotFilters';
import { useI18n } from '../i18n';
import type { BasemapStyle } from '../components/Map/mapStyles';

// Load programs at module level — this is a static JSON import
import programsData from '../../public/data/programs/index.json';

const ALL_PROGRAMS: ProgramEntry[] = (
  programsData.programs as Array<{
    id: string;
    code: string;
    name: string;
    color: string;
    hasReferences: boolean;
  }>
);

// Module-level flag: once references have loaded once, never show overlay again
// (unless user explicitly clicks "Update data" which reloads the page)
let hasLoadedOnce = false;

export default function MapView() {
  const { t } = useI18n();
  const { visibility, toggle, showAll, hideAll } =
    useLayerVisibility(ALL_PROGRAMS);

  // T34 — external point trigger for OverlapFinder from LocationSearch
  const [searchedPoint, setSearchedPoint] = useState<{ lat: number; lon: number } | null>(null);

  const [activeBasemap, setActiveBasemap] = useState<BasemapStyle>('standard');

  // Loading state: show overlay only on first visit, not when navigating back
  const [mapReady, setMapReady] = useState(hasLoadedOnce);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapInstance || hasLoadedOnce) return;
    const refPrograms = ALL_PROGRAMS.filter((p) => p.hasReferences);

    const checkReady = () => {
      const allSourcesLoaded = refPrograms.every((p) => {
        try {
          return !!mapInstance.getSource(sourceId(p.code.toLowerCase()));
        } catch {
          return false;
        }
      });
      if (allSourcesLoaded && mapInstance.areTilesLoaded()) {
        hasLoadedOnce = true;
        setMapReady(true);
      }
    };

    mapInstance.on('idle', checkReady);
    return () => {
      mapInstance.off('idle', checkReady);
    };
  }, [mapInstance]);

  // Force-refresh PMTiles data by clearing caches and reloading sources
  const handleUpdateData = useCallback(() => {
    if (!mapInstance) return;
    setMapReady(false);
    const refPrograms = ALL_PROGRAMS.filter((p) => p.hasReferences);
    for (const p of refPrograms) {
      const src = sourceId(p.code.toLowerCase());
      const lyr = layerId(p.code.toLowerCase());
      try {
        if (mapInstance.getLayer(lyr)) mapInstance.removeLayer(lyr);
        if (mapInstance.getSource(src)) mapInstance.removeSource(src);
      } catch {
        // ignore
      }
    }
    // Clear browser cache for PMTiles and reload page
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name);
      });
    }
    window.location.reload();
  }, [mapInstance]);

  // T26 — spot polling
  const { spots } = useSpotPoller({
    needsSig: true,
    needsGoodLocation: true,
    limit: 200,
  });

  // T28 — spot filters (shared with SpotList page via localStorage)
  const { filterSpots } = useSpotFilters();
  const filteredSpots = useMemo(() => filterSpots(spots), [filterSpots, spots]);

  // Build list of layer IDs for the popup click handler
  const referenceLayerIds = useMemo(
    () => ALL_PROGRAMS.map((p) => layerId(p.code.toLowerCase())),
    [],
  );

  // Detect dark mode changes and switch basemap accordingly
  useEffect(() => {
    const syncDarkMode = () => {
      const dark = document.documentElement.classList.contains('dark');
      setActiveBasemap((prev) => {
        // Only auto-switch if user hasn't chosen 'outdoor'
        if (prev === 'outdoor') return prev;
        return dark ? 'dark' : 'standard';
      });
    };
    const observer = new MutationObserver(syncDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">{t.loadingReferences}</p>
        </div>
      )}
      <MapContainer>
        {(map: maplibregl.Map | null) => {
          // Capture map instance for loading tracking
          if (map && map !== mapInstance) {
            // Use setTimeout to avoid setState during render
            setTimeout(() => setMapInstance(map), 0);
          }
          return (
          <>
            {/* Reference layers — rendered into map when map is ready */}
            {map &&
              ALL_PROGRAMS.filter((p) => p.hasReferences).map((program, index) => (
                <ReferenceLayer
                  key={program.code}
                  map={map}
                  program={program.code.toLowerCase()}
                  color={program.color}
                  visible={visibility[program.code] ?? false}
                  index={index}
                />
              ))}

            {/* Reference popup on click (T16) */}
            {map && (
              <ReferencePopup
                map={map}
                layerIds={referenceLayerIds}
                t={t}
              />
            )}

            {/* GPS location marker */}
            {map && <LocationMarker map={map} />}

            {/* T29 — Spot layer (above reference layers) */}
            {map && <SpotLayer map={map} spots={filteredSpots} />}

            {/* T34 — Location search: top row on mobile (full width), centered on desktop */}
            <div className="pointer-events-none absolute top-2 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-10 flex">
              <LocationSearch
                map={map}
                onLocationSelected={(lat, lon) => setSearchedPoint({ lat, lon })}
              />
            </div>

            {/* Layer switcher sidebar — below search on mobile, top-left on desktop */}
            <div className="pointer-events-none absolute top-12 sm:top-2 left-2 z-10 flex flex-col">
              <LayerSwitcher
                programs={ALL_PROGRAMS}
                visibility={visibility}
                onToggle={toggle}
                onShowAll={showAll}
                onHideAll={hideAll}
                onUpdateData={handleUpdateData}
              />
            </div>

            {/* T30/T31 — Overlap finder (right-click / long-press) */}
            {map && <OverlapFinder map={map} externalPoint={searchedPoint} onActivate={showAll} />}

            {/* T31 — "What counts here?" button — below search on mobile, top-right on desktop */}
            <div className="pointer-events-none absolute top-12 sm:top-2 right-2 sm:right-12 z-10 flex">
              <WhatCountsHere map={map} onActivate={showAll} />
            </div>

            {/* Basemap selector — bottom-right overlay */}
            {map && (
              <div className="pointer-events-none absolute bottom-6 sm:bottom-8 right-2 z-10 flex">
                <BasemapSelector
                  map={map}
                  activeStyle={activeBasemap}
                  onStyleChange={setActiveBasemap}
                />
              </div>
            )}
          </>
          );
        }}
      </MapContainer>
    </div>
  );
}
