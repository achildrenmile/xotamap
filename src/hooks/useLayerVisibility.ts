import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'xotamap-layer-visibility';

/**
 * Load persisted visibility map from localStorage.
 * Returns null if nothing is stored yet.
 */
function loadFromStorage(): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return null;
  }
}

function saveToStorage(visibility: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  } catch {
    // Ignore storage errors
  }
}

interface UseLayerVisibilityResult {
  visibility: Record<string, boolean>;
  isVisible: (programCode: string) => boolean;
  toggle: (programCode: string) => void;
  setVisible: (programCode: string, visible: boolean) => void;
  showAll: () => void;
  hideAll: () => void;
}

/**
 * Manages per-program layer visibility state.
 * Persists to localStorage. Tier-1 programs are on by default.
 */
export function useLayerVisibility(
  programs: Array<{ code: string; tier: number; hasReferences: boolean }>,
): UseLayerVisibilityResult {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    const stored = loadFromStorage();
    if (stored) {
      // Fill in any programs not yet in storage (default: tier-1 on)
      const merged: Record<string, boolean> = { ...stored };
      for (const p of programs) {
        if (!(p.code in merged)) {
          merged[p.code] = p.tier === 1 && p.hasReferences;
        }
      }
      return merged;
    }
    // First visit: default to tier-1 programs with references = on
    const defaults: Record<string, boolean> = {};
    for (const p of programs) {
      defaults[p.code] = p.tier === 1 && p.hasReferences;
    }
    return defaults;
  });

  // Persist to storage whenever visibility changes
  useEffect(() => {
    saveToStorage(visibility);
  }, [visibility]);

  const isVisible = useCallback(
    (programCode: string) => visibility[programCode] ?? false,
    [visibility],
  );

  const toggle = useCallback((programCode: string) => {
    setVisibility((prev) => ({
      ...prev,
      [programCode]: !prev[programCode],
    }));
  }, []);

  const setVisible = useCallback((programCode: string, visible: boolean) => {
    setVisibility((prev) => ({ ...prev, [programCode]: visible }));
  }, []);

  const showAll = useCallback(() => {
    setVisibility((prev) => {
      const next = { ...prev };
      for (const code of Object.keys(next)) {
        next[code] = true;
      }
      return next;
    });
  }, []);

  const hideAll = useCallback(() => {
    setVisibility((prev) => {
      const next = { ...prev };
      for (const code of Object.keys(next)) {
        next[code] = false;
      }
      return next;
    });
  }, []);

  return { visibility, isVisible, toggle, setVisible, showAll, hideAll };
}
